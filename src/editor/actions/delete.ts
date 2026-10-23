import { useCallback } from 'react';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { deleteBlockFromTimeline, findRawBlock } from '../commands/blockCommands';

/** Encapsulates deletion of one or multiple selected editor blocks. */
export function useEditorDeleteActions(options: {
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
}) {
  const {
    timelineRef,
    selectedBlockId,
    selectedBlockIds,
    commitTimelineChange,
    setSelectedBlockId,
  } = options;

  const deleteSelectedBlock = useCallback(() => {
    if (!selectedBlockId) {
      return;
    }

    const found = findRawBlock(timelineRef.current, selectedBlockId);
    if (!found) {
      return;
    }

    const ids = selectedBlockIds.length ? [...selectedBlockIds] : [selectedBlockId];

    commitTimelineChange((previousTimeline) => {
      let nextTimeline = previousTimeline;
      // Delete deepest paths first so selecting a parent and its child is safe.
      for (const id of [...ids].sort((a, b) => b.split('/').length - a.split('/').length)) {
        nextTimeline = deleteBlockFromTimeline(nextTimeline, id);
      }
      return nextTimeline;
    });

    setSelectedBlockId(null);
  }, [selectedBlockId, selectedBlockIds, timelineRef, commitTimelineChange, setSelectedBlockId]);

  return { deleteSelectedBlock };
}
