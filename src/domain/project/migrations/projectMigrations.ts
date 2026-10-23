import { CURRENT_PROJECT_VERSION, type ProjectDocument } from '../projectDocument';

export type MigrationStep = {
  from: number;
  to: number;
  migrate: (input: Record<string, unknown>) => Record<string, unknown>;
};

const DEFAULT_COMPOSITION = { width: 1080, height: 1920, fps: 30 };

/**
 * v1 -> v2 introduced an explicit composition contract. Older projects are
 * allowed to omit it; use the editor's historical default rather than
 * mutating their visual timeline.
 */
const migrateV1ToV2: MigrationStep = {
  from: 1,
  to: 2,
  migrate: (input) => ({
    ...input,
    version: 2,
    composition: input.composition ?? DEFAULT_COMPOSITION,
  }),
};

/**
 * v2 -> v3 normalized audio references. Binary data remains outside the
 * document; legacy single-audio data is represented by audioTracks while
 * preserving its assetId.
 */
const migrateV2ToV3: MigrationStep = {
  from: 2,
  to: 3,
  migrate: (input) => {
    const next: Record<string, unknown> = { ...input, version: 3 };
    const legacyAudio = input.audio;
    const tracks = input.audioTracks;

    if (!Array.isArray(tracks) && legacyAudio && typeof legacyAudio === 'object') {
      const audio = legacyAudio as Record<string, unknown>;
      const assetId = typeof audio.assetId === 'string' ? audio.assetId : undefined;
      next.audioTracks = [
        {
          id: assetId ?? 'legacy-audio',
          assetId,
          state: audio.state,
          fileName: audio.fileName,
          mimeType: audio.mimeType,
        },
      ];
    }

    return next;
  },
};

/**
 * v3 -> v4 introduces optional project/scene background styles. Both fields
 * are intentionally optional so old documents inherit the renderer fallback.
 */
const migrateV3ToV4: MigrationStep = {
  from: 3,
  to: 4,
  migrate: (input) => ({ ...input, version: 4 }),
};

const MIGRATIONS: MigrationStep[] = [migrateV1ToV2, migrateV2ToV3, migrateV3ToV4];

export type MigrationResult = {
  project: ProjectDocument;
  migrated: boolean;
  fromVersion: number;
  toVersion: number;
};

export function migrateProject(value: unknown): MigrationResult {
  if (!value || typeof value !== 'object') throw new Error('INVALID_PROJECT');

  let current = { ...(value as Record<string, unknown>) };
  const rawVersion = current.version;
  const version = typeof rawVersion === 'number' && Number.isInteger(rawVersion) ? rawVersion : 1;

  if (version > CURRENT_PROJECT_VERSION) {
    throw new Error(`UNSUPPORTED_PROJECT_VERSION:${version}`);
  }

  const fromVersion = version;
  let currentVersion = version;

  while (currentVersion < CURRENT_PROJECT_VERSION) {
    const step = MIGRATIONS.find((candidate) => candidate.from === currentVersion);
    if (!step) throw new Error(`MIGRATION_NOT_FOUND:${currentVersion}`);
    current = step.migrate(current);
    currentVersion = step.to;
  }

  current.version = CURRENT_PROJECT_VERSION;

  return {
    project: current as ProjectDocument,
    migrated: fromVersion !== CURRENT_PROJECT_VERSION,
    fromVersion,
    toVersion: CURRENT_PROJECT_VERSION,
  };
}

export function getProjectMigrationPath(fromVersion: number): number[] {
  if (fromVersion > CURRENT_PROJECT_VERSION) return [];
  const path: number[] = [];
  let current = fromVersion;
  while (current < CURRENT_PROJECT_VERSION) {
    const step = MIGRATIONS.find((candidate) => candidate.from === current);
    if (!step) return [];
    path.push(step.to);
    current = step.to;
  }
  return path;
}
