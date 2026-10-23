import { useCallback } from 'react';

import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';
import type { VisualBlockData } from '../domain/blocks/blockTypes';
import type { ResolvedEditorBlock } from './editorTypes';

import { updateBlockInTimeline } from './commands/blockCommands';
import { useEditorContentActions } from './actions/content';
import { useEditorLayerActions } from './actions/layer';
import { useEditorPositionActions } from './actions/position';
import { useEditorTimingActions } from './actions/timing';
import { useEditorAnimationActions } from './actions/animation';
import { useEditorAddActions } from './actions/add';
import { useEditorTransformActions } from './actions/transform';
import { useEditorOverlayActions } from './actions/overlay';
import { useEditorGroupingActions } from './actions/grouping';
import { useEditorClipboardActions } from './actions/clipboard';
import { useEditorDeleteActions } from './actions/delete';
import { useEditorSplitActions } from './actions/split';

type UseEditorActionsOptions = {
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  selectedBlock: ResolvedEditorBlock | undefined;
  selectedBlockId: string | null;
  selectedBlockIds?: string[];
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
  setSelectedBlockIdRaw?: (id: string | null) => void;
  setSelectedBlockIds?: React.Dispatch<React.SetStateAction<string[]>>;
  getSceneDurationFrames?: (segmentId: string) => number | undefined;
};

export function useEditorActions({
  timelineRef,
  selectedBlock,
  selectedBlockId,
  selectedBlockIds = [],
  commitTimelineChange,
  setSelectedBlockId,
  setSelectedBlockIdRaw,
  setSelectedBlockIds,
  getSceneDurationFrames,
}: UseEditorActionsOptions) {

  const updateBlock = useCallback(
    (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => {
      commitTimelineChange((previousTimeline) =>
        updateBlockInTimeline(previousTimeline, editorId, updater),
      );
    },
    [commitTimelineChange],
  );

  const deleteActions = useEditorDeleteActions({
    timelineRef,
    selectedBlockId,
    selectedBlockIds,
    commitTimelineChange,
    setSelectedBlockId,
  });

  const splitActions = useEditorSplitActions({ commitTimelineChange });

  const clipboardActions = useEditorClipboardActions({
    timelineRef,
    selectedBlock,
    commitTimelineChange,
    setSelectedBlockId,
  });

  const groupingActions = useEditorGroupingActions({
    timelineRef,
    selectedBlock,
    selectedBlockIds,
    commitTimelineChange,
    setSelectedBlockId,
    setSelectedBlockIdRaw,
    setSelectedBlockIds,
    getSceneDurationFrames,
  });

  const contentActions = useEditorContentActions({ selectedBlock, selectedBlockId, updateBlock });
  const layerActions = useEditorLayerActions({
    selectedBlockId,
    selectedBlockIds,
    updateBlock,
    commitTimelineChange,
  });
  const positionActions = useEditorPositionActions({ selectedBlockId, updateBlock });
  const timingActions = useEditorTimingActions({ selectedBlockId, selectedBlock, updateBlock });
  const animationActions = useEditorAnimationActions({
    selectedBlockId,
    selectedBlockDuration: selectedBlock?.duration ?? 1,
    updateBlock,
  });
  const addActions = useEditorAddActions({ timelineRef, commitTimelineChange, setSelectedBlockId });
  const transformActions = useEditorTransformActions({
    selectedBlockId,
    selectedBlock,
    updateBlock,
  });
  const overlayActions = useEditorOverlayActions({
    timelineRef,
    commitTimelineChange,
    updateBlock,
    setSelectedBlockId,
    selectedBlockIds,
  });

  return {
    clipboardRef: clipboardActions.clipboardRef,
    hasClipboard: clipboardActions.hasClipboard,
    updateBlock,
    splitBlockAtFrame: splitActions.splitBlockAtFrame,
    addBlock: addActions.addBlock,
    deleteSelectedBlock: deleteActions.deleteSelectedBlock,
    copySelectedBlock: clipboardActions.copySelectedBlock,
    pasteBlock: clipboardActions.pasteBlock,
    duplicateSelectedBlock: clipboardActions.duplicateSelectedBlock,
    ...groupingActions,
    ...contentActions,
    ...layerActions,
    ...positionActions,
    ...timingActions,
    ...animationActions,
    ...transformActions,
    ...overlayActions,
  };
}
