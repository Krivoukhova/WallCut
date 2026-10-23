import { useMemo } from 'react';

import { buildEditorTimeline } from '../../domain/timeline/editorTimeline';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

export type UseEditorTimelineStateProps = {
  timeline: TTSTimeline;
  editorVisualTimeline: VisualTimelineData;
  currentFrame: number;
};

/** Derives the editor timeline and frame-dependent timeline information. */
export const useEditorTimelineState = ({
  timeline,
  editorVisualTimeline,
  currentFrame,
}: UseEditorTimelineStateProps) => {
  const runtimeTimeline = useMemo(
    () => buildEditorTimeline(timeline, editorVisualTimeline),
    [timeline, editorVisualTimeline],
  );

  const currentSegment = useMemo(
    () =>
      runtimeTimeline.segments.find(
        (segment) =>
          currentFrame >= segment.startFrame &&
          currentFrame < segment.startFrame + segment.durationFrames,
      ),
    [runtimeTimeline, currentFrame],
  );

  const editorDuration = useMemo(() => {
    if (!runtimeTimeline.segments.length) {
      return 1;
    }

    return Math.max(
      ...runtimeTimeline.segments.map((segment) => segment.startFrame + segment.durationFrames),
    );
  }, [runtimeTimeline]);

  return {
    runtimeTimeline,
    currentSegment,
    editorDuration,
  };
};
