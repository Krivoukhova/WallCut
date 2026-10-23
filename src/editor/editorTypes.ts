import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';
import type { VisualBlockData } from '../domain/blocks/blockTypes';
import type { ResolvedBlock } from '../domain/resolution/blockResolver';

export type EditorSnapshot = VisualTimelineData;

export type ResolvedEditorBlock = ResolvedBlock & {
  editorId: string;
  segmentId: string;
  segmentDuration: number;
  absoluteStartFrame: number;
};

export type EditorClipboard = {
  block: VisualBlockData;
  segmentId: string;
};
