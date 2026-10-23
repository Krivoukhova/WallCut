import { useCallback } from 'react';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { splitBlockInTimeline } from '../commands/blockCommands';

type UseEditorSplitActionsOptions = {
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
};

/** Encapsulates splitting a timeline block at a local frame. */
export function useEditorSplitActions({ commitTimelineChange }: UseEditorSplitActionsOptions) {
  const splitBlockAtFrame = useCallback(
    (editorId: string, localFrame: number) => {
      commitTimelineChange((previousTimeline) =>
        splitBlockInTimeline(previousTimeline, editorId, localFrame),
      );
    },
    [commitTimelineChange],
  );

  return { splitBlockAtFrame };
}
