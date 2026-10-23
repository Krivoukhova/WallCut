import type { VisualTimelineData } from '../timeline/visualTimelineTypes';

export type EditorState = {
  selectedBlockId: string | null;

  selectedSegmentId: string | null;

  timeline: VisualTimelineData;
};

export function createEditorState(timeline: VisualTimelineData): EditorState {
  return {
    selectedBlockId: null,

    selectedSegmentId: timeline.segments[0]?.id ?? null,

    timeline,
  };
}
