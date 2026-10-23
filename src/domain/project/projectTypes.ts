/**
 * Backwards-compatible project type exports.
 *
 * ProjectDocument is the canonical persisted model. ShortsProject remains an
 * alias for compatibility with modules that have not migrated to the canonical name.
 */
export {
  CURRENT_PROJECT_VERSION,
  type AssetId,
  type ProjectAssetRef,
  type ProjectComposition,
  type ProjectDocument,
  type ProjectId,
} from './projectDocument';

import type { ProjectDocument } from './projectDocument';

export type ShortsProject = ProjectDocument;

export type { BackgroundStyle } from '../background/backgroundTypes';
