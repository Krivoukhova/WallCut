import type { VisualBlockData } from '../blocks/blockTypes';
import type { VisualPosition } from '../layout/layoutTypes';
import type { BackgroundStyle } from '../background/backgroundTypes';

export type VisualTimelineBlock = VisualBlockData & {
  position?: VisualPosition;
};

export type VisualTimelineSegment = {
  id: string;
  /** User-facing scene name. */
  name?: string;
  blocks: VisualTimelineBlock[];
  /** Optional scene duration override in frames. */
  durationFrames?: number;
  /** Optional scene-level background override; omitted means inherit project background. */
  background?: BackgroundStyle;
  /** Opacity applied to all visual content in this scene, independently of its background. */
  contentOpacity?: number;
};

export type VisualTimelineData = {
  segments: VisualTimelineSegment[];
};
