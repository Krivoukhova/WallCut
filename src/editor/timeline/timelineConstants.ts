import type { TrackId } from './timelineTypes';

export const BASE_TIMELINE_HEIGHT = 220;
export const MIN_TIMELINE_HEIGHT = 160;
export const MAX_TIMELINE_HEIGHT = 700;

export const HEADER_HEIGHT = 38;
export const COLLAPSED_HEADER_HEIGHT = 26;
export const RULER_HEIGHT = 28;
export const TRACK_HEIGHT = 36;
export const LABEL_WIDTH = 150;

export const MIN_BLOCK_WIDTH = 12;

export const SNAP_FRAME_STEP = 5;
export const SNAP_FRAME_THRESHOLD = 6;

export const DRAG_THRESHOLD_PX = 4;

export const MIN_DURATION_FRAMES = 1;

export const TRACK_IDS: TrackId[] = ['background', 'image', 'character', 'text', 'shape', 'other'];

export const TRACK_ICONS: Record<TrackId, string> = {
  background: '▧',
  image: '▣',
  character: '♙',
  text: 'T',
  shape: '◆',
  other: '•',
};
