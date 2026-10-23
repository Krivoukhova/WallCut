import type { ResolvedEditorBlock } from '../editorTypes';

export type TrackId = 'background' | 'image' | 'character' | 'text' | 'shape' | 'other';

export type TimelineSubTrack = {
  blocks: ResolvedEditorBlock[];
  endFrame: number;
};

export type InteractionType = 'move' | 'resize-left' | 'resize-right';

export type InteractionState = {
  type: InteractionType;

  editorId: string;
  /** Last resolved block snapshot keeps a drag alive while a scene transfer changes its React key. */
  lastBlock: ResolvedEditorBlock;

  pointerStartX: number;
  pointerStartY: number;

  startPointerFrame: number;

  originalStartFrame: number;
  originalDuration: number;

  startFrame: number;
  duration: number;

  dragging: boolean;
};
