import { useCallback } from 'react';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

import type { VisualBlockData, VisualBlockLayer } from '../../domain/blocks/blockTypes';

import { reorderBlocksInTimeline } from '../commands/blockCommands';

export function useEditorLayerActions(options: {
  selectedBlockId: string | null;
  selectedBlockIds?: string[];
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
}) {
  const { selectedBlockId, selectedBlockIds = [], updateBlock, commitTimelineChange } = options;

  const updateSelectedLayer = useCallback(
    (layer: VisualBlockLayer) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        layer,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedZIndex = useCallback(
    (zIndex: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        zIndex,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const moveSelectedForward = useCallback(() => {
    if (!selectedBlockId) {
      return;
    }

    commitTimelineChange((previousTimeline) =>
      reorderBlocksInTimeline(
        previousTimeline,
        selectedBlockIds.length ? selectedBlockIds : [selectedBlockId],
        'forward',
      ),
    );
  }, [selectedBlockId, selectedBlockIds, commitTimelineChange]);

  const moveSelectedBackward = useCallback(() => {
    if (!selectedBlockId) {
      return;
    }

    commitTimelineChange((previousTimeline) =>
      reorderBlocksInTimeline(
        previousTimeline,
        selectedBlockIds.length ? selectedBlockIds : [selectedBlockId],
        'backward',
      ),
    );
  }, [selectedBlockId, selectedBlockIds, commitTimelineChange]);

  const bringSelectedToFront = useCallback(() => {
    if (!selectedBlockId) {
      return;
    }

    commitTimelineChange((previousTimeline) =>
      reorderBlocksInTimeline(
        previousTimeline,
        selectedBlockIds.length ? selectedBlockIds : [selectedBlockId],
        'front',
      ),
    );
  }, [selectedBlockId, selectedBlockIds, commitTimelineChange]);

  const sendSelectedToBack = useCallback(() => {
    if (!selectedBlockId) {
      return;
    }

    commitTimelineChange((previousTimeline) =>
      reorderBlocksInTimeline(
        previousTimeline,
        selectedBlockIds.length ? selectedBlockIds : [selectedBlockId],
        'back',
      ),
    );
  }, [selectedBlockId, selectedBlockIds, commitTimelineChange]);

  return {
    updateSelectedLayer,
    updateSelectedZIndex,
    moveSelectedForward,
    moveSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,
  };
}
