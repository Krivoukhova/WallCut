import { CURRENT_PROJECT_VERSION } from '../../domain/project/projectDocument';
import { ProjectService } from '../../application/project/projectService';
import type { ProjectStorage, ProjectRecord } from '../../application/project/projectStorage';
import type { AssetRepository, StoredAsset } from '../../application/assets/assetRepository';
import type { ShortsProject } from '../../domain/project/projectTypes';
import { assert, assertEqual } from './testUtils';

const state = {
  startFrame: 0,
  durationFrames: 30,
  sourceStartFrame: 0,
  sourceEndFrame: 30,
  volume: 1,
  muted: false,
};

function project(assetId: string): ShortsProject {
  return {
    version: CURRENT_PROJECT_VERSION,
    composition: { width: 1080, height: 1920, fps: 30 },
    visualTimeline: { segments: [] },
    audioTracks: [{ id: 'track-1', assetId, state }],
  };
}

function makeStorage(record: ProjectRecord, failPut = false): ProjectStorage {
  return {
    listProjects: async () => [record],
    getProject: async (_owner, id) => (id === record.id ? record : null),
    putProject: async (next) => {
      if (failPut) throw new Error('PUT_FAILED');
      record = next;
    },
    deleteProject: async () => undefined,
  };
}

function makeAssets(initial: StoredAsset, failClearOrphaned = false) {
  const assets = new Map([[initial.ref.id, initial]]);
  const deleted: string[] = [];
  let garbageCollectionReferences: string[] | undefined;
  const repository: AssetRepository = {
    get: async (_projectId, id) => assets.get(id) ?? null,
    put: async (asset) => {
      assets.set(asset.ref.id, asset);
    },
    delete: async (_projectId, id) => {
      deleted.push(id);
      assets.delete(id);
    },
    markOrphaned: async () => undefined,
    clearOrphaned: async (_projectId, id) => {
      if (failClearOrphaned) throw new Error('CLEAR_ORPHANED_FAILED');
      const asset = assets.get(id);
      if (asset) {
        const restored = { ...asset };
        delete restored.orphanedAt;
        assets.set(id, restored);
      }
    },
    collectGarbage: async (_projectId, _olderThan, referencedAssetIds) => {
      garbageCollectionReferences = [...referencedAssetIds];
      return [];
    },
    listByProject: async () => [...assets.values()],
  };
  return {
    repository,
    assets,
    deleted,
    get garbageCollectionReferences() {
      return garbageCollectionReferences;
    },
  };
}

export async function runProjectServiceInvariantTests(): Promise<void> {
  const oldAsset: StoredAsset = {
    ref: { id: 'asset-old', kind: 'audio' },
    projectId: 'p1',
    binary: new ArrayBuffer(1),
    createdAt: new Date().toISOString(),
  };
  const record: ProjectRecord = {
    id: 'p1',
    ownerId: 'user-1',
    name: 'Project',
    template: 'blank',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    project: project('asset-old'),
  };
  const assets = makeAssets(oldAsset);
  const service = new ProjectService(
    makeStorage(record),
    assets.repository,
    'user-1',
    { generate: () => 'new-id' },
    { clone: <T>(value: T) => structuredClone(value) },
  );

  const staleClientProject = { ...project('asset-stale'), metadata: { name: 'Changed' } };
  const saved = await service.updateProject('p1', { project: staleClientProject });
  assert(
    saved?.project.audioTracks?.[0]?.assetId === 'asset-old',
    'stale client assetId must never replace persisted assetId',
  );

  const failingAssets = makeAssets(oldAsset);
  const failingService = new ProjectService(
    makeStorage(record, true),
    failingAssets.repository,
    'user-1',
    { generate: () => 'asset-new' },
    { clone: <T>(value: T) => structuredClone(value) },
  );
  let failed = false;
  try {
    await failingService.updateProject('p1', {
      project: project('asset-old'),
      audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(2), state }],
    });
  } catch {
    failed = true;
  }
  assert(failed, 'failed project commit must reject');
  assertEqual(
    failingAssets.deleted.length,
    0,
    'old asset must not be deleted before project commit',
  );
  assert(
    failingAssets.assets.has('asset-old'),
    'old asset must remain recoverable after failed commit',
  );
  assert(
    Boolean(failingAssets.assets.get('asset-new')?.orphanedAt),
    'an uploaded asset whose project commit failed must be marked as a GC candidate',
  );

  // If uploading a binary fails before the project commit, the project record
  // must keep pointing at its previous asset; a partial upload is never enough
  // to publish new audio metadata.
  {
    let currentRecord: ProjectRecord = { ...record, project: project('asset-old') };
    let projectWrites = 0;
    const uploadFailureStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        projectWrites += 1;
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const baseAssets = makeAssets(oldAsset);
    const uploadFailureAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async () => {
        throw new Error('ASSET_UPLOAD_FAILED');
      },
    };
    const uploadFailureService = new ProjectService(
      uploadFailureStorage,
      uploadFailureAssets,
      'user-1',
      { generate: () => 'asset-upload-failed' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    let uploadFailed = false;
    try {
      await uploadFailureService.updateProject('p1', {
        project: project('asset-old'),
        audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(7), state }],
      });
    } catch (error) {
      uploadFailed = error instanceof Error && error.message === 'ASSET_UPLOAD_FAILED';
    }
    assert(uploadFailed, 'asset upload failure must propagate to the caller');
    assertEqual(projectWrites, 0, 'project metadata must not commit when an asset upload fails');
    assertEqual(
      currentRecord.project.audioTracks?.[0]?.assetId,
      'asset-old',
      'failed upload must preserve the old audio reference',
    );
  }

  // If a multi-file upload fails partway through, every successfully written
  // binary must already be marked as an orphan so a later GC pass can reclaim it.
  {
    let currentRecord: ProjectRecord = { ...record, project: project('asset-old') };
    let projectWrites = 0;
    const partialUploadStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        projectWrites += 1;
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const baseAssets = makeAssets(oldAsset);
    let uploadAttempt = 0;
    const partialUploadAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async (asset) => {
        uploadAttempt += 1;
        if (uploadAttempt === 2) throw new Error('SECOND_ASSET_UPLOAD_FAILED');
        await baseAssets.repository.put(asset);
      },
    };
    let generatedId = 0;
    const partialUploadService = new ProjectService(
      partialUploadStorage,
      partialUploadAssets,
      'user-1',
      { generate: () => `partial-asset-${++generatedId}` },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const twoTrackProject: ShortsProject = {
      ...project('asset-old'),
      audioTracks: [
        { id: 'track-1', assetId: 'asset-old', state },
        { id: 'track-2', state },
      ],
    };
    let partialUploadFailed = false;
    try {
      await partialUploadService.updateProject('p1', {
        project: twoTrackProject,
        audioAssets: [
          { id: 'track-1', binary: new ArrayBuffer(4), state },
          { id: 'track-2', binary: new ArrayBuffer(5), state },
        ],
      });
    } catch (error) {
      partialUploadFailed =
        error instanceof Error && error.message === 'SECOND_ASSET_UPLOAD_FAILED';
    }
    assert(partialUploadFailed, 'a failure in the second upload must propagate');
    assertEqual(
      projectWrites,
      0,
      'project metadata must not commit after a partial multi-file upload',
    );
    assertEqual(
      currentRecord.project.audioTracks?.[0]?.assetId,
      'asset-old',
      'partial upload must preserve the committed audio reference',
    );
    assert(
      Boolean(baseAssets.assets.get('partial-asset-1')?.orphanedAt),
      'a binary uploaded before a later upload fails must remain marked as a GC candidate',
    );
    assert(
      !baseAssets.assets.has('partial-asset-2'),
      'the failed upload must not create an asset record',
    );
  }

  const reconciliationAssets = makeAssets(oldAsset, true);
  const reconciliationService = new ProjectService(
    makeStorage(record),
    reconciliationAssets.repository,
    'user-1',
    { generate: () => 'asset-reconcile' },
    { clone: <T>(value: T) => structuredClone(value) },
  );
  const reconciledSave = await reconciliationService.updateProject('p1', {
    project: project('asset-old'),
    audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(3), state }],
  });
  assert(
    reconciledSave?.project.audioTracks?.[0]?.assetId === 'asset-reconcile',
    'metadata reconciliation failure must not report failure after the project commit succeeds',
  );

  await service.collectOrphanedAssets('p1');
  assert(
    assets.garbageCollectionReferences?.includes('asset-old'),
    'project service must pass currently referenced asset IDs to the repository GC',
  );

  // A delete must wait until an in-flight update has committed its asset and
  // project record; otherwise the delete transaction could remove the asset
  // and the later project write could recreate a dangling reference.
  {
    let currentRecord: ProjectRecord | undefined = { ...record, project: project('asset-old') };
    let releasePut!: () => void;
    let signalPutStarted!: () => void;
    const putStarted = new Promise<void>((resolve) => {
      signalPutStarted = resolve;
    });
    const putGate = new Promise<void>((resolve) => {
      releasePut = resolve;
    });
    const order: string[] = [];
    const lockedStorage: ProjectStorage = {
      listProjects: async () => (currentRecord ? [currentRecord] : []),
      getProject: async (_owner, id) => (currentRecord?.id === id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
        order.push('project-committed');
      },
      deleteProject: async (_owner, id) => {
        order.push('delete-started');
        if (currentRecord?.id === id) currentRecord = undefined;
      },
    };
    const baseAssets = makeAssets(oldAsset);
    const lockedAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async (asset) => {
        signalPutStarted();
        await putGate;
        await baseAssets.repository.put(asset);
      },
    };
    const lockedService = new ProjectService(
      lockedStorage,
      lockedAssets,
      'user-1',
      { generate: () => 'asset-lock-new' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const update = lockedService.updateProject('p1', {
      project: project('asset-old'),
      audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(4), state }],
    });
    await putStarted;
    const deletion = lockedService.deleteProject('p1');
    await Promise.resolve();
    assert(!order.includes('delete-started'), 'delete must wait for the update critical section');
    releasePut();
    await update;
    await deletion;
    assert(
      order.indexOf('project-committed') < order.indexOf('delete-started'),
      'update must commit before deletion starts',
    );
    assert(!currentRecord, 'serialized deletion must leave the project deleted');
  }

  // Concurrent updates must serialize and the later patch must be applied to
  // the latest committed record rather than an earlier snapshot.
  {
    let currentRecord: ProjectRecord = { ...record, name: 'Initial name', template: 'blank' };
    let putCount = 0;
    let signalFirstPut!: () => void;
    let releaseFirstPut!: () => void;
    const firstPutStarted = new Promise<void>((resolve) => {
      signalFirstPut = resolve;
    });
    const firstPutGate = new Promise<void>((resolve) => {
      releaseFirstPut = resolve;
    });
    const concurrentStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        putCount += 1;
        if (putCount === 1) {
          signalFirstPut();
          await firstPutGate;
        }
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const concurrentAssets = makeAssets(oldAsset);
    const concurrentService = new ProjectService(
      concurrentStorage,
      concurrentAssets.repository,
      'user-1',
      { generate: () => 'concurrent-asset' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const firstUpdate = concurrentService.updateProject('p1', { name: 'First update' });
    await firstPutStarted;
    const secondUpdate = concurrentService.updateProject('p1', { template: 'starter' });
    await Promise.resolve();
    assertEqual(putCount, 1, 'second update must wait while the first update is committing');
    releaseFirstPut();
    await Promise.all([firstUpdate, secondUpdate]);
    assertEqual(
      currentRecord.name,
      'First update',
      "second update must preserve the first update's name change",
    );
    assertEqual(
      currentRecord.template,
      'starter',
      'second update must commit its own template change',
    );
  }

  // Duplication must serialize with deletion: it must not copy a stale
  // source snapshot or create a new project after the source has been removed.
  {
    let currentRecord: ProjectRecord | undefined = { ...record, project: project('asset-old') };
    let signalDeleteStarted!: () => void;
    let releaseDelete!: () => void;
    const deleteStarted = new Promise<void>((resolve) => {
      signalDeleteStarted = resolve;
    });
    const deleteGate = new Promise<void>((resolve) => {
      releaseDelete = resolve;
    });
    const duplicateStorage: ProjectStorage = {
      listProjects: async () => (currentRecord ? [currentRecord] : []),
      getProject: async (_owner, id) => (currentRecord?.id === id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
      },
      deleteProject: async (_owner, id) => {
        signalDeleteStarted();
        await deleteGate;
        if (currentRecord?.id === id) currentRecord = undefined;
      },
    };
    const duplicateAssets = makeAssets(oldAsset);
    const duplicateService = new ProjectService(
      duplicateStorage,
      duplicateAssets.repository,
      'user-1',
      { generate: () => 'duplicate-id' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const deletion = duplicateService.deleteProject('p1');
    await deleteStarted;
    const duplication = duplicateService.duplicateProject('p1');
    await Promise.resolve();
    releaseDelete();
    await deletion;
    const duplicate = await duplication;
    assertEqual(duplicate, null, 'duplication must return null if source deletion wins the lock');
    assertEqual(currentRecord, undefined, 'duplication must not recreate the deleted source');
  }

  // getProject must wait for an in-flight update before reading its record;
  // otherwise it can return the old metadata/audio reference after the update
  // has committed.
  {
    let currentRecord: ProjectRecord = {
      ...record,
      name: 'Before save',
      project: project('asset-old'),
    };
    let releaseUpload!: () => void;
    let signalUploadStarted!: () => void;
    const uploadStarted = new Promise<void>((resolve) => {
      signalUploadStarted = resolve;
    });
    const uploadGate = new Promise<void>((resolve) => {
      releaseUpload = resolve;
    });
    const freshStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const baseAssets = makeAssets(oldAsset);
    const delayedAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async (asset) => {
        signalUploadStarted();
        await uploadGate;
        await baseAssets.repository.put(asset);
      },
    };
    const freshService = new ProjectService(
      freshStorage,
      delayedAssets,
      'user-1',
      { generate: () => 'asset-fresh' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const save = freshService.updateProject('p1', {
      name: 'After save',
      project: project('asset-old'),
      audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(8), state }],
    });
    await uploadStarted;
    const read = freshService.getProject('p1');
    await Promise.resolve();
    assertEqual(
      currentRecord.name,
      'Before save',
      'test setup must hold the update before its project record commit',
    );
    releaseUpload();
    await save;
    const loaded = await read;
    assertEqual(
      loaded?.name,
      'After save',
      'getProject must return metadata from the completed save',
    );
    assertEqual(
      loaded?.project.audioTracks?.[0]?.assetId,
      'asset-fresh',
      'getProject must return the newly committed audio asset reference',
    );
    assertEqual(
      loaded?.audioTracks[0]?.binary.byteLength,
      8,
      'getProject must hydrate the binary for the newly committed audio asset',
    );
  }

  // A delayed migration must not overwrite a newer save that commits while
  // hydration is waiting for the same project's lock.
  {
    const legacyRecord: ProjectRecord = {
      ...record,
      updatedAt: '2020-01-01T00:00:00.000Z',
      project: { ...project('asset-old'), version: 1 } as unknown as ShortsProject,
    };
    let currentRecord = legacyRecord;
    let releasePut!: () => void;
    let signalPutStarted!: () => void;
    const putStarted = new Promise<void>((resolve) => {
      signalPutStarted = resolve;
    });
    const putGate = new Promise<void>((resolve) => {
      releasePut = resolve;
    });
    const migrationStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const baseAssets = makeAssets(oldAsset);
    const migrationAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async (asset) => {
        signalPutStarted();
        await putGate;
        await baseAssets.repository.put(asset);
      },
    };
    const migrationService = new ProjectService(
      migrationStorage,
      migrationAssets,
      'user-1',
      { generate: () => 'asset-migration-race' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const update = migrationService.updateProject('p1', {
      project: project('asset-old'),
      audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(6), state }],
    });
    await putStarted;
    const staleReadHydration = migrationService.getProject('p1');
    releasePut();
    await update;
    await staleReadHydration;
    assertEqual(
      currentRecord.project.version,
      CURRENT_PROJECT_VERSION,
      'stale migration must not downgrade a newly saved project',
    );
    assertEqual(
      currentRecord.project.audioTracks?.[0]?.assetId,
      'asset-migration-race',
      'stale migration must not replace newly committed audio references',
    );
  }

  // Dashboard listing must refresh records after GC: the initial list can
  // become stale while maintenance is running, including if a project is deleted.
  {
    const initial: ProjectRecord = {
      ...record,
      name: 'Old name',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    let currentRecord: ProjectRecord | undefined = initial;
    const listingStorage: ProjectStorage = {
      listProjects: async () => [initial],
      getProject: async (_owner, id) => (currentRecord?.id === id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
      },
      deleteProject: async () => {
        currentRecord = undefined;
      },
    };
    const baseAssets = makeAssets(oldAsset);
    const listingAssets: AssetRepository = {
      ...baseAssets.repository,
      collectGarbage: async () => {
        currentRecord = currentRecord
          ? { ...currentRecord, name: 'Updated name', updatedAt: '2025-01-01T00:00:00.000Z' }
          : undefined;
        return [];
      },
    };
    const listingService = new ProjectService(
      listingStorage,
      listingAssets,
      'user-1',
      { generate: () => 'listing-id' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const listed = await listingService.listProjects();
    assertEqual(listed.length, 1, 'existing project must remain in refreshed dashboard listing');
    assertEqual(
      listed[0].name,
      'Updated name',
      'dashboard listing must return the latest record after GC',
    );

    currentRecord = initial;
    listingAssets.collectGarbage = async () => {
      currentRecord = undefined;
      return [];
    };
    const afterDeletion = await listingService.listProjects();
    assertEqual(
      afterDeletion.length,
      0,
      'dashboard listing must not return a project deleted during GC',
    );
  }

  // GC takes its reference snapshot only after any update for the same
  // project has completed, so its protected ID set includes newly committed
  // assets rather than a stale pre-update snapshot.
  {
    let currentRecord: ProjectRecord = { ...record, project: project('asset-old') };
    let releasePut!: () => void;
    let signalPutStarted!: () => void;
    const putStarted = new Promise<void>((resolve) => {
      signalPutStarted = resolve;
    });
    const putGate = new Promise<void>((resolve) => {
      releasePut = resolve;
    });
    let gcReferences: string[] = [];
    const gcStorage: ProjectStorage = {
      listProjects: async () => [currentRecord],
      getProject: async (_owner, id) => (id === currentRecord.id ? currentRecord : null),
      putProject: async (next) => {
        currentRecord = next;
      },
      deleteProject: async () => undefined,
    };
    const baseAssets = makeAssets(oldAsset);
    const gcAssets: AssetRepository = {
      ...baseAssets.repository,
      put: async (asset) => {
        signalPutStarted();
        await putGate;
        await baseAssets.repository.put(asset);
      },
      collectGarbage: async (_projectId, _olderThan, refs) => {
        gcReferences = [...refs];
        return [];
      },
    };
    const gcService = new ProjectService(
      gcStorage,
      gcAssets,
      'user-1',
      { generate: () => 'asset-gc-new' },
      { clone: <T>(value: T) => structuredClone(value) },
    );
    const update = gcService.updateProject('p1', {
      project: project('asset-old'),
      audioAssets: [{ id: 'track-1', binary: new ArrayBuffer(5), state }],
    });
    await putStarted;
    const gc = gcService.collectOrphanedAssets('p1', 0);
    await Promise.resolve();
    assertEqual(gcReferences.length, 0, 'GC must wait while an update is in progress');
    releasePut();
    await update;
    await gc;
    assert(gcReferences.includes('asset-gc-new'), 'GC must protect the newly committed asset');
  }
}
