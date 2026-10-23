import type { AssetRepository, StoredAsset } from '../../application/assets/assetRepository';
import type { ProjectAssetRef } from '../../domain/project/projectDocument';
import type { ProjectRecord, ProjectStorage } from '../../domain/project/storage/projectStorage';

export type { ProjectRecord, ProjectStorage } from '../../domain/project/storage/projectStorage';
export type { AssetRepository, StoredAsset } from '../../application/assets/assetRepository';

// Keep the legacy database name to preserve existing users' saved projects.
const DB_NAME = 'finance-shorts';
const DB_VERSION = 3;
const PROJECTS_STORE = 'projects';
const ASSETS_STORE = 'assets';

type IndexedDbAssetRecord = {
  id: string;
  projectId: string;
  kind: ProjectAssetRef['kind'];
  blob: Blob | ArrayBuffer;
  fileName: string;
  mimeType: string;
  createdAt: string;
  orphanedAt?: string;
};

class IndexedDbProjectStorage implements ProjectStorage, AssetRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    const opening = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('INDEXED_DB_UNAVAILABLE'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error ?? new Error('INDEXED_DB_OPEN_FAILED'));
      request.onblocked = () => reject(new Error('INDEXED_DB_OPEN_BLOCKED'));
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        }
        const projects = request.transaction?.objectStore(PROJECTS_STORE);
        if (projects && !projects.indexNames.contains('ownerId')) {
          projects.createIndex('ownerId', 'ownerId', { unique: false });
        }
        if (projects && !projects.indexNames.contains('updatedAt')) {
          projects.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        // Always reconcile the asset-store index during upgrades. Earlier
        // versions created the store and index together, but an interrupted or
        // externally modified database can leave the store present without the
        // index; checking only store existence would make every asset query fail.
        const assets = db.objectStoreNames.contains(ASSETS_STORE)
          ? request.transaction?.objectStore(ASSETS_STORE)
          : db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        if (assets && !assets.indexNames.contains('projectId')) {
          assets.createIndex('projectId', 'projectId', { unique: false });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          if (this.dbPromise === opening) this.dbPromise = null;
        };
        resolve(db);
      };
    });
    this.dbPromise = opening;
    void opening.catch(() => {
      // A transient startup/private-mode failure must not poison all later calls.
      if (this.dbPromise === opening) this.dbPromise = null;
    });
    return opening;
  }

  private transaction<T>(
    stores: string[],
    mode: IDBTransactionMode,
    action: (tx: IDBTransaction) => IDBRequest<T>,
  ): Promise<T> {
    return this.open().then(
      (db) =>
        new Promise<T>((resolve, reject) => {
          let request: IDBRequest<T>;
          let result: T | undefined;
          let requestSucceeded = false;
          let settled = false;
          const fail = (error: unknown) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error('INDEXED_DB_TRANSACTION_FAILED'));
          };

          let tx: IDBTransaction | null = null;
          try {
            tx = db.transaction(stores, mode);
            request = action(tx);
          } catch (error) {
            // If action() queued any requests before throwing, abort rather than
            // allowing a partially scheduled write transaction to commit.
            try {
              tx?.abort();
            } catch {
              /* The transaction may already be inactive. */
            }
            fail(error);
            return;
          }

          request.onerror = () => fail(request.error ?? new Error('INDEXED_DB_REQUEST_FAILED'));
          request.onsuccess = () => {
            result = request.result;
            requestSucceeded = true;
          };
          tx.oncomplete = () => {
            if (settled) return;
            if (!requestSucceeded) {
              fail(new Error('INDEXED_DB_REQUEST_DID_NOT_COMPLETE'));
              return;
            }
            settled = true;
            resolve(result as T);
          };
          tx.onerror = () => fail(tx.error ?? new Error('INDEXED_DB_TRANSACTION_FAILED'));
          tx.onabort = () => fail(tx.error ?? new Error('INDEXED_DB_TRANSACTION_ABORTED'));
        }),
    );
  }

  listProjects(ownerId: string): Promise<ProjectRecord[]> {
    return this.transaction<ProjectRecord[]>([PROJECTS_STORE], 'readonly', (tx) =>
      tx.objectStore(PROJECTS_STORE).index('ownerId').getAll(ownerId),
    ).then((projects) => projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  getProject(ownerId: string, id: string): Promise<ProjectRecord | null> {
    return this.transaction<ProjectRecord | undefined>([PROJECTS_STORE], 'readonly', (tx) =>
      tx.objectStore(PROJECTS_STORE).get(id),
    ).then((project) => (project?.ownerId === ownerId ? project : null));
  }

  putProject(project: ProjectRecord): Promise<void> {
    return this.transaction<IDBValidKey>([PROJECTS_STORE], 'readwrite', (tx) =>
      tx.objectStore(PROJECTS_STORE).put(project),
    ).then(() => undefined);
  }

  deleteProject(ownerId: string, id: string): Promise<void> {
    return this.open().then(
      (db) =>
        new Promise((resolve, reject) => {
          let settled = false;
          const fail = (error: DOMException | Error | null | undefined, fallback: string) => {
            if (settled) return;
            settled = true;
            reject(error ?? new Error(fallback));
          };

          let tx: IDBTransaction;
          try {
            tx = db.transaction([PROJECTS_STORE, ASSETS_STORE], 'readwrite');
          } catch (error) {
            fail(error instanceof Error ? error : null, 'INDEXED_DB_DELETE_FAILED');
            return;
          }

          const projects = tx.objectStore(PROJECTS_STORE);
          const assets = tx.objectStore(ASSETS_STORE);
          const projectRequest = projects.get(id);

          projectRequest.onsuccess = () => {
            const project = projectRequest.result as ProjectRecord | undefined;
            // A missing project or one owned by another user is an intentional no-op.
            if (project?.ownerId !== ownerId) return;

            projects.delete(id);
            const cursorRequest = assets.index('projectId').openCursor(IDBKeyRange.only(id));
            cursorRequest.onsuccess = () => {
              const cursor = cursorRequest.result;
              if (!cursor) return;
              cursor.delete();
              cursor.continue();
            };
            cursorRequest.onerror = () =>
              fail(cursorRequest.error, 'INDEXED_DB_ASSET_DELETE_FAILED');
          };

          projectRequest.onerror = () =>
            fail(projectRequest.error, 'INDEXED_DB_PROJECT_DELETE_FAILED');
          tx.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve();
          };
          tx.onerror = () => fail(tx.error, 'INDEXED_DB_DELETE_FAILED');
          tx.onabort = () => fail(tx.error, 'INDEXED_DB_DELETE_ABORTED');
        }),
    );
  }

  get(projectId: string, assetId: string): Promise<StoredAsset | null> {
    return this.transaction<IndexedDbAssetRecord | undefined>([ASSETS_STORE], 'readonly', (tx) =>
      tx.objectStore(ASSETS_STORE).get(assetId),
    ).then(async (asset) => {
      if (!asset || asset.projectId !== projectId) return null;
      return this.toStoredAsset(asset);
    });
  }

  put(asset: StoredAsset): Promise<void> {
    return this.transaction<IDBValidKey>([ASSETS_STORE], 'readwrite', (tx) =>
      tx.objectStore(ASSETS_STORE).put({
        id: asset.ref.id,
        projectId: asset.projectId,
        kind: asset.ref.kind,
        blob: asset.binary,
        fileName: asset.ref.fileName ?? 'asset',
        mimeType: asset.ref.mimeType ?? 'application/octet-stream',
        createdAt: asset.createdAt,
        orphanedAt: asset.orphanedAt,
      }),
    ).then(() => undefined);
  }

  delete(projectId: string, assetId: string): Promise<void> {
    return this.open().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          let settled = false;
          const fail = (error: unknown, fallback: string) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(fallback));
          };

          let tx: IDBTransaction;
          try {
            tx = db.transaction([ASSETS_STORE], 'readwrite');
            const assets = tx.objectStore(ASSETS_STORE);
            const request = assets.get(assetId);
            request.onsuccess = () => {
              if (settled) return;
              try {
                const asset = request.result as IndexedDbAssetRecord | undefined;
                // Asset IDs are global keys; never delete another project's asset.
                if (asset?.projectId === projectId) assets.delete(assetId);
              } catch (error) {
                fail(error, 'INDEXED_DB_ASSET_DELETE_FAILED');
                try {
                  tx.abort();
                } catch {
                  /* The transaction may already be inactive. */
                }
              }
            };
            request.onerror = () => fail(request.error, 'INDEXED_DB_ASSET_LOOKUP_FAILED');
            tx.oncomplete = () => {
              if (settled) return;
              settled = true;
              resolve();
            };
            tx.onerror = () => fail(tx.error, 'INDEXED_DB_ASSET_DELETE_FAILED');
            tx.onabort = () => fail(tx.error, 'INDEXED_DB_ASSET_DELETE_ABORTED');
          } catch (error) {
            fail(error, 'INDEXED_DB_ASSET_DELETE_FAILED');
          }
        }),
    );
  }

  markOrphaned(projectId: string, assetId: string, orphanedAt: string): Promise<void> {
    return this.open().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          let settled = false;
          const fail = (error: unknown, fallback: string) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(fallback));
          };

          let tx: IDBTransaction;
          try {
            tx = db.transaction([ASSETS_STORE], 'readwrite');
            const assets = tx.objectStore(ASSETS_STORE);
            const request = assets.get(assetId);
            request.onsuccess = () => {
              if (settled) return;
              try {
                const asset = request.result as IndexedDbAssetRecord | undefined;
                if (asset?.projectId === projectId && !asset.orphanedAt) {
                  assets.put({ ...asset, orphanedAt });
                }
              } catch (error) {
                fail(error, 'INDEXED_DB_ASSET_ORPHAN_FAILED');
                try {
                  tx.abort();
                } catch {
                  /* The transaction may already be inactive. */
                }
              }
            };
            request.onerror = () => fail(request.error, 'INDEXED_DB_ASSET_LOOKUP_FAILED');
            tx.oncomplete = () => {
              if (settled) return;
              settled = true;
              resolve();
            };
            tx.onerror = () => fail(tx.error, 'INDEXED_DB_ASSET_ORPHAN_FAILED');
            tx.onabort = () => fail(tx.error, 'INDEXED_DB_ASSET_ORPHAN_ABORTED');
          } catch (error) {
            fail(error, 'INDEXED_DB_ASSET_ORPHAN_FAILED');
          }
        }),
    );
  }

  clearOrphaned(projectId: string, assetId: string): Promise<void> {
    return this.open().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          let settled = false;
          const fail = (error: unknown, fallback: string) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(fallback));
          };

          let tx: IDBTransaction;
          try {
            tx = db.transaction([ASSETS_STORE], 'readwrite');
            const assets = tx.objectStore(ASSETS_STORE);
            const request = assets.get(assetId);
            request.onsuccess = () => {
              if (settled) return;
              try {
                const asset = request.result as IndexedDbAssetRecord | undefined;
                if (asset?.projectId === projectId && asset.orphanedAt) {
                  const restored = { ...asset };
                  delete restored.orphanedAt;
                  assets.put(restored);
                }
              } catch (error) {
                fail(error, 'INDEXED_DB_ASSET_RESTORE_FAILED');
                try {
                  tx.abort();
                } catch {
                  /* The transaction may already be inactive. */
                }
              }
            };
            request.onerror = () => fail(request.error, 'INDEXED_DB_ASSET_LOOKUP_FAILED');
            tx.oncomplete = () => {
              if (settled) return;
              settled = true;
              resolve();
            };
            tx.onerror = () => fail(tx.error, 'INDEXED_DB_ASSET_RESTORE_FAILED');
            tx.onabort = () => fail(tx.error, 'INDEXED_DB_ASSET_RESTORE_ABORTED');
          } catch (error) {
            fail(error, 'INDEXED_DB_ASSET_RESTORE_FAILED');
          }
        }),
    );
  }

  collectGarbage(
    projectId: string,
    olderThan: string,
    referencedAssetIds: readonly string[],
  ): Promise<string[]> {
    const referenced = new Set(referencedAssetIds);
    return this.open().then(
      (db) =>
        new Promise<string[]>((resolve, reject) => {
          let settled = false;
          const fail = (error: unknown, fallback: string) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(fallback));
          };

          let tx: IDBTransaction;
          let request: IDBRequest<IDBCursorWithValue | null>;
          try {
            tx = db.transaction([ASSETS_STORE], 'readwrite');
            const assets = tx.objectStore(ASSETS_STORE);
            const deleted: string[] = [];
            request = assets.index('projectId').openCursor(IDBKeyRange.only(projectId));

            request.onsuccess = () => {
              if (settled) return;
              try {
                const cursor = request.result;
                if (!cursor) return;
                const asset = cursor.value as IndexedDbAssetRecord;
                if (referenced.has(asset.id)) {
                  // A previous reconciliation may have failed after the project was
                  // committed. Never delete a referenced asset, and repair its stale
                  // orphan marker while the same write transaction is open.
                  if (asset.orphanedAt) {
                    const restored = { ...asset };
                    delete restored.orphanedAt;
                    cursor.update(restored);
                  }
                } else if (asset.orphanedAt && asset.orphanedAt <= olderThan) {
                  deleted.push(asset.id);
                  cursor.delete();
                }
                cursor.continue();
              } catch (error) {
                fail(error, 'INDEXED_DB_ASSET_GC_FAILED');
                try {
                  tx.abort();
                } catch {
                  /* The transaction may already be inactive. */
                }
              }
            };
            request.onerror = () => fail(request.error, 'INDEXED_DB_ASSET_GC_FAILED');
            tx.oncomplete = () => {
              if (settled) return;
              settled = true;
              resolve(deleted);
            };
            tx.onerror = () => fail(tx.error, 'INDEXED_DB_ASSET_GC_FAILED');
            tx.onabort = () => fail(tx.error, 'INDEXED_DB_ASSET_GC_ABORTED');
          } catch (error) {
            fail(error, 'INDEXED_DB_ASSET_GC_FAILED');
          }
        }),
    );
  }

  listByProject(projectId: string): Promise<StoredAsset[]> {
    return this.transaction<IndexedDbAssetRecord[]>([ASSETS_STORE], 'readonly', (tx) =>
      tx.objectStore(ASSETS_STORE).index('projectId').getAll(projectId),
    ).then((assets) => Promise.all(assets.map((asset) => this.toStoredAsset(asset))));
  }

  private async toStoredAsset(asset: IndexedDbAssetRecord): Promise<StoredAsset> {
    return {
      ref: {
        id: asset.id,
        kind: asset.kind,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      },
      projectId: asset.projectId,
      binary: asset.blob instanceof Blob ? await asset.blob.arrayBuffer() : asset.blob,
      createdAt: asset.createdAt,
      orphanedAt: asset.orphanedAt,
    };
  }
}

const indexedDbStorage = new IndexedDbProjectStorage();

export const projectStorage: ProjectStorage = indexedDbStorage;
export const assetRepository: AssetRepository = indexedDbStorage;
