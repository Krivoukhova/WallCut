import type { AssetId, ProjectAssetRef } from '../../domain/project/projectDocument';

/**
 * Application port for binary project assets.
 *
 * The project document stores only ProjectAssetRef metadata. Binary payloads
 * live behind this port so the editor does not care whether they are backed
 * by IndexedDB, OPFS, or a remote store in the future.
 */
export type AssetBinary = ArrayBuffer;

export type StoredAsset = {
  ref: ProjectAssetRef;
  projectId: string;
  binary: AssetBinary;
  createdAt: string;
  orphanedAt?: string;
};

export interface AssetRepository {
  get(projectId: string, assetId: AssetId): Promise<StoredAsset | null>;
  put(asset: StoredAsset): Promise<void>;
  delete(projectId: string, assetId: AssetId): Promise<void>;
  markOrphaned(projectId: string, assetId: AssetId, orphanedAt: string): Promise<void>;
  clearOrphaned(projectId: string, assetId: AssetId): Promise<void>;
  collectGarbage(
    projectId: string,
    olderThan: string,
    referencedAssetIds: readonly string[],
  ): Promise<string[]>;
  listByProject(projectId: string): Promise<StoredAsset[]>;
}
