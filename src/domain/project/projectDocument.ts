import type { AudioTrackState } from '../audio/audioTrackTypes';
import type { VisualTimelineData } from '../timeline/visualTimelineTypes';
import type { BackgroundStyle } from '../background/backgroundTypes';

export const CURRENT_PROJECT_VERSION = 4 as const;

export type ProjectId = string;
export type AssetId = string;

export type ProjectComposition = {
  width: number;
  height: number;
  fps: number;
};

/**
 * A serializable reference to binary data owned by the project's asset store.
 * The document never contains Blob/File/URL instances.
 */
export type ProjectAssetRef = {
  id: AssetId;
  kind: 'audio' | 'image' | 'video' | 'font' | 'other';
  fileName?: string;
  mimeType?: string;
};

/**
 * Canonical persisted editor document.
 *
 * Keep this type free of React, browser objects and runtime-only values.
 * Runtime URLs, Blob instances and Player state belong to infrastructure/application layers.
 */
export type ProjectDocument = {
  version: typeof CURRENT_PROJECT_VERSION;
  composition: ProjectComposition;
  /** Default background inherited by scenes without their own override. */
  background?: BackgroundStyle;
  visualTimeline: VisualTimelineData;
  assets?: ProjectAssetRef[];
  audio?: {
    assetId?: AssetId;
    state: AudioTrackState;
    fileName?: string;
    mimeType?: string;
  };
  audioTracks?: Array<{
    id: string;
    assetId?: AssetId;
    state: AudioTrackState;
    fileName?: string;
    mimeType?: string;
  }>;
  metadata?: {
    name?: string;
    description?: string;
  };
};
