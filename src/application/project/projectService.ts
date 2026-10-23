import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { validateShortsProject } from '../../domain/project/projectValidation';
import { migrateProject } from '../../domain/project/migrations/projectMigrations';
import { CURRENT_PROJECT_VERSION, type ShortsProject } from '../../domain/project/projectTypes';
import type { AssetRepository } from '../assets/assetRepository';
import type { ProjectRecord, ProjectStorage } from './projectStorage';
import type { IdGenerator, CloneService } from '../runtime/runtimeServices';

export type LocalAudioTrack = NonNullable<ShortsProject['audioTracks']>[number] & {
  binary: ArrayBuffer;
};

type AudioTrackState = NonNullable<ShortsProject['audioTracks']>[number]['state'];

export type LocalProject = ProjectRecord & {
  audioTracks: LocalAudioTrack[];
};

export type ProjectAudioTrackPatch = {
  id: string;
  state: AudioTrackState;
  fileName?: string;
  mimeType?: string;
};

export type ProjectAudioAssetPatch = ProjectAudioTrackPatch & {
  binary: ArrayBuffer;
};

export type ProjectPatch = Partial<Pick<LocalProject, 'name' | 'template' | 'project'>> & {
  audioTracks?: ProjectAudioTrackPatch[];
  audioAssets?: ProjectAudioAssetPatch[];
};

const now = () => new Date().toISOString();
function normalizeProject(project: ShortsProject): ShortsProject {
  const migration = migrateProject(project);
  const normalized = migration.project as ShortsProject;
  const validation = validateShortsProject(normalized);
  if (!validation.valid || !validation.project) {
    const firstError = validation.issues.find((issue) => issue.severity === 'error');
    throw new Error(
      `INVALID_PROJECT:${firstError?.path ?? 'project'}:${firstError?.message ?? 'Invalid project'}`,
    );
  }
  return validation.project;
}

/**
 * Application use cases for project persistence and asset hydration.
 * Concrete storage is injected by the composition root.
 */
export class ProjectService {
  constructor(
    private readonly projectStorage: ProjectStorage,
    private readonly assetRepository: AssetRepository,
    private readonly ownerId: string,
    private readonly ids: IdGenerator,
    private readonly clone: CloneService,
  ) {}

  private readonly projectLocks = new Map<string, Promise<void>>();

  private async withProjectLock<T>(id: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.projectLocks.get(id) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.projectLocks.set(id, current);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.projectLocks.get(id) === current) this.projectLocks.delete(id);
    }
  }

  private async hydrate(
    record: ProjectRecord,
    includeBinary = true,
    persistMigration = true,
  ): Promise<LocalProject> {
    const migration = migrateProject(record.project);
    const normalizedProject = normalizeProject(migration.project as ShortsProject);
    const normalizedRecord = { ...record, project: normalizedProject };
    if (migration.migrated && persistMigration) {
      // Migration writes must serialize with edits and deletion. Re-read inside
      // the lock and only migrate the exact revision we originally loaded;
      // otherwise a stale read could overwrite a newer save or resurrect a
      // project that was deleted while hydration was in progress.
      await this.withProjectLock(record.id, async () => {
        const latest = await this.projectStorage.getProject(this.ownerId, record.id);
        if (!latest || latest.updatedAt !== record.updatedAt) return;

        const latestMigration = migrateProject(latest.project);
        if (!latestMigration.migrated) return;
        const latestProject = normalizeProject(latestMigration.project as ShortsProject);
        await this.projectStorage.putProject({
          ...latest,
          project: latestProject,
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (!includeBinary) {
      return { ...normalizedRecord, audioTracks: [] };
    }

    if (normalizedRecord.project.audioTracks?.length) {
      const audioTracks = await Promise.all(
        normalizedRecord.project.audioTracks.map(async (track) => {
          if (!track.assetId) throw new Error(`PROJECT_ASSET_MISSING:${track.id}:assetId`);
          const asset = await this.assetRepository.get(record.id, track.assetId);
          if (!asset?.binary) throw new Error(`PROJECT_ASSET_MISSING:${track.id}:${track.assetId}`);
          return { ...track, binary: asset.binary };
        }),
      );
      return { ...normalizedRecord, audioTracks };
    }

    const assetId = normalizedRecord.project.audio?.assetId;
    if (!assetId) return { ...normalizedRecord, audioTracks: [] };
    const asset = await this.assetRepository.get(record.id, assetId);
    if (!asset?.binary) throw new Error(`PROJECT_ASSET_MISSING:audio:${assetId}`);
    const legacyTrack = normalizedRecord.project.audio
      ? {
          id: assetId,
          assetId,
          state: normalizedRecord.project.audio.state,
          fileName: normalizedRecord.project.audio.fileName,
          mimeType: normalizedRecord.project.audio.mimeType,
          binary: asset.binary,
        }
      : undefined;

    return { ...normalizedRecord, audioTracks: legacyTrack ? [legacyTrack] : [] };
  }

  async collectOrphanedAssets(
    projectId: string,
    gracePeriodMs = 7 * 24 * 60 * 60 * 1000,
  ): Promise<string[]> {
    // Keep the reference snapshot and GC in the same per-project critical
    // section as edits/deletion. Otherwise a stale snapshot can race with an
    // update and make a newly referenced asset eligible for removal.
    return this.withProjectLock(projectId, async () => {
      const project = await this.projectStorage.getProject(this.ownerId, projectId);
      if (!project) return [];
      const referencedAssetIds = new Set<string>();
      for (const track of project.project.audioTracks ?? []) {
        if (track.assetId) referencedAssetIds.add(track.assetId);
      }
      if (project.project.audio?.assetId) referencedAssetIds.add(project.project.audio.assetId);
      for (const ref of project.project.assets ?? []) referencedAssetIds.add(ref.id);

      const olderThan = new Date(Date.now() - gracePeriodMs).toISOString();
      return this.assetRepository.collectGarbage(projectId, olderThan, [...referencedAssetIds]);
    });
  }

  async listProjects(): Promise<LocalProject[]> {
    const records = await this.projectStorage.listProjects(this.ownerId);
    // GC is best-effort and never allowed to break the project dashboard.
    await Promise.allSettled(records.map((record) => this.collectOrphanedAssets(record.id)));

    // The initial list is only a set of IDs, not a durable snapshot: an edit or
    // deletion may have completed while GC was running. Re-read each record so
    // the dashboard doesn't return stale project metadata or resurrect a
    // project that was removed after the initial list query.
    const refreshedRecords = await Promise.all(
      records.map((record) => this.projectStorage.getProject(this.ownerId, record.id)),
    );
    const currentRecords = refreshedRecords.filter(
      (record): record is ProjectRecord => record !== null,
    );
    const results = await Promise.allSettled(
      currentRecords.map((record) => this.hydrate(record, false)),
    );
    const projects: LocalProject[] = [];
    const errors: unknown[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') projects.push(result.value);
      else errors.push(result.reason);
    }
    if (errors.length) {
      const error = new Error('PROJECT_LIST_PARTIAL_FAILURE');
      Object.assign(error, { errors, projects });
      throw error;
    }
    return projects;
  }

  async getProject(id: string): Promise<LocalProject | null> {
    // Read and hydrate under the same per-project lock as writes. Reading first
    // and hydrating later can return a stale record if an update commits while
    // its audio assets are being loaded. Migration persistence also happens
    // inside this critical section so it cannot race with a newer save/delete.
    return this.withProjectLock(id, async () => {
      const record = await this.projectStorage.getProject(this.ownerId, id);
      if (!record) return null;

      const migration = migrateProject(record.project);
      if (!migration.migrated) return this.hydrate(record, true, false);

      const migratedRecord: ProjectRecord = {
        ...record,
        project: normalizeProject(migration.project as ShortsProject),
        updatedAt: now(),
      };
      await this.projectStorage.putProject(migratedRecord);
      return this.hydrate(migratedRecord, true, false);
    });
  }

  async createProject(
    visualTimeline: VisualTimelineData,
    name = 'Untitled Project',
    template: 'blank' | 'starter' = 'blank',
    project?: ShortsProject,
  ): Promise<LocalProject> {
    const id = this.ids.generate();
    const timestamp = now();
    const document: ShortsProject = normalizeProject(
      project ?? {
        version: CURRENT_PROJECT_VERSION,
        composition: { width: 1080, height: 1920, fps: 30 },
        visualTimeline,
        metadata: { name },
      },
    );

    const record: ProjectRecord = {
      id,
      ownerId: this.ownerId,
      name,
      template,
      createdAt: timestamp,
      updatedAt: timestamp,
      project: document,
    };

    await this.projectStorage.putProject(record);
    return this.hydrate(record);
  }

  async updateProject(id: string, patch: ProjectPatch): Promise<LocalProject | null> {
    return this.withProjectLock(id, async () => {
      const current = await this.projectStorage.getProject(this.ownerId, id);
      if (!current) throw new Error('PROJECT_NOT_FOUND');

      const nextProject = patch.project ? normalizeProject(patch.project) : current.project;
      const currentTracks = current.project.audioTracks ?? [];
      const requestedTracks = patch.audioTracks ?? nextProject.audioTracks ?? currentTracks;
      const currentByTrackId = new Map(currentTracks.map((track) => [track.id, track]));
      const assetPatches = new Map((patch.audioAssets ?? []).map((track) => [track.id, track]));
      const audioTracks = requestedTracks.map((track) => {
        const assetPatch = assetPatches.get(track.id);
        const currentTrack = currentByTrackId.get(track.id);
        const assetId = assetPatch ? this.ids.generate() : currentTrack?.assetId;
        return {
          ...track,
          assetId,
        };
      });

      // Binary writes happen before the project record is committed. If the
      // project write fails, the old project remains valid and only orphaned
      // new assets may need later garbage collection.
      for (const track of audioTracks) {
        const assetPatch = assetPatches.get(track.id);
        if (!assetPatch || !track.assetId) continue;
        await this.assetRepository.put({
          ref: {
            id: track.assetId,
            kind: 'audio',
            fileName: assetPatch.fileName ?? 'audio',
            mimeType: assetPatch.mimeType ?? 'application/octet-stream',
          },
          projectId: id,
          binary: assetPatch.binary,
          createdAt: now(),
          // Treat uncommitted uploads as GC candidates from the start. Once
          // the project record commits, reconciliation clears this marker for
          // every asset that the committed document references.
          orphanedAt: now(),
        });
      }

      const projectWithAudio: ShortsProject = {
        ...nextProject,
        audio: undefined,
        audioTracks,
      };
      const next: ProjectRecord = {
        id: current.id,
        ownerId: current.ownerId,
        name: patch.name ?? current.name,
        template: patch.template ?? current.template,
        createdAt: current.createdAt,
        updatedAt: now(),
        project: normalizeProject(projectWithAudio),
      };

      await this.projectStorage.putProject(next);

      // Never physically delete an asset as part of an ordinary edit. Undo/redo
      // may restore the previous document and therefore still need its binary.
      // Assets that are no longer referenced become orphaned and are collected
      // later by the grace-period GC.
      const referencedAssetIds = new Set<string>();
      for (const track of next.project.audioTracks ?? [])
        if (track.assetId) referencedAssetIds.add(track.assetId);
      if (next.project.audio?.assetId) referencedAssetIds.add(next.project.audio.assetId);
      for (const ref of next.project.assets ?? []) referencedAssetIds.add(ref.id);

      // Project persistence is the commit point. Reconciliation is deliberately
      // best-effort: a metadata failure must not report a failed save after the
      // project has already been committed. Referenced IDs are also passed to
      // GC, which protects committed assets even if clearing an orphan marker
      // fails and lets a later GC pass repair that marker.
      try {
        const allAssets = await this.assetRepository.listByProject(id);
        const orphanedAt = now();
        await Promise.allSettled(
          allAssets.map((asset) => {
            if (referencedAssetIds.has(asset.ref.id)) {
              return asset.orphanedAt
                ? this.assetRepository.clearOrphaned(id, asset.ref.id)
                : Promise.resolve();
            }
            return this.assetRepository.markOrphaned(
              id,
              asset.ref.id,
              asset.orphanedAt ?? orphanedAt,
            );
          }),
        );
      } catch {
        // Keep the committed project authoritative; orphan reconciliation can
        // be retried on the next project-list/maintenance pass.
      }

      // This update already owns the project lock and has committed a current-version document.
      return this.hydrate(next, true, false);
    });
  }

  async duplicateProject(id: string): Promise<LocalProject | null> {
    // Hold the source lock from the authoritative read through copying its
    // document and audio. Otherwise a concurrent delete/update can make the
    // duplicate operation copy a stale snapshot or create a copy after the
    // source has already been deleted.
    return this.withProjectLock(id, async () => {
      const sourceRecord = await this.projectStorage.getProject(this.ownerId, id);
      if (!sourceRecord) return null;
      // Migration persistence is disabled here because this operation already
      // owns the source lock; hydration still normalizes the in-memory copy.
      const source = await this.hydrate(sourceRecord, true, false);

      const duplicateProjectDocument = this.clone.clone(source.project);
      delete duplicateProjectDocument.audioTracks;
      delete duplicateProjectDocument.audio;

      const duplicate = await this.createProject(
        source.project.visualTimeline,
        `${source.name} Copy`,
        source.template,
        duplicateProjectDocument,
      );

      if (source.audioTracks.length) {
        return (
          (await this.updateProject(duplicate.id, {
            // Track metadata and binary payloads are separate by design. Supplying
            // only audioTracks would create tracks that point at nonexistent assets.
            audioTracks: source.audioTracks.map((track) => ({
              id: track.id,
              state: track.state,
              fileName: track.fileName,
              mimeType: track.mimeType,
            })),
            audioAssets: source.audioTracks.map((track) => ({
              id: track.id,
              binary: track.binary,
              state: track.state,
              fileName: track.fileName,
              mimeType: track.mimeType,
            })),
          })) ?? duplicate
        );
      }

      return duplicate;
    });
  }

  async deleteProject(id: string): Promise<void> {
    // Deletion must serialize with updates and GC for this project. The storage
    // adapter deletes the project and its assets atomically; this lock prevents
    // same-service operations from writing assets or taking a GC snapshot
    // while that deletion is in progress.
    await this.withProjectLock(id, () => this.projectStorage.deleteProject(this.ownerId, id));
  }
}
