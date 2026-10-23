import { uiText } from '../../domain/i18n/uiText';
import { useCallback, useState } from 'react';

import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

import { useEditorHistory } from '../editorHistory';

import { useEditorActions } from '../useEditorActions';

import { useEditorKeyboard } from '../useEditorKeyboard';

import { useI18n } from '../i18n/I18nContext';

import type { ApplicationRuntime } from '../../application/runtime/runtimeServices';

import {
  blockSelection,
  getSelectedBlockId,
  getSelectedBlockIds,
  noSelection,
  sceneSelection,
  type EditorSelection,
} from '../../domain/editor/selection';

import { useEditorScenes } from './useEditorScenes';
import { useEditorTimelineBlocks } from './useEditorTimelineBlocks';
import { useSelectedEditorBlock } from './useSelectedEditorBlock';
import { useEditorBlockArrangement } from './useEditorBlockArrangement';
import { useEditorContainerChildren } from './useEditorContainerChildren';
import { useResolvedEditorBlocks } from './useResolvedEditorBlocks';
import { useActiveEditorBlocks } from './useActiveEditorBlocks';
import { useEditorTimelineState } from './useEditorTimelineState';
import { createEditorInspectorProps } from './createEditorInspectorProps';

type UseEditorProps = {
  timeline: TTSTimeline;
  visualTimeline: VisualTimelineData;
  runtime: ApplicationRuntime;
  externalUndo?: () => boolean;
  externalRedo?: () => boolean;
};

export const useEditor = ({
  timeline,
  visualTimeline,
  runtime,
  externalUndo,
  externalRedo,
}: UseEditorProps) => {
  const { language, translations: t } = useI18n();

  const editorHistory = useEditorHistory({
    initialTimeline: visualTimeline,
    clone: runtime.clone,
  });

  const {
    timeline: editorVisualTimeline,
    timelineRef,

    canUndo,
    canRedo,

    commitTimelineChange,

    beginInteraction,
    endInteraction,

    undo,
    redo,
  } = editorHistory;

  const [savedTimeline, setSavedTimeline] = useState<VisualTimelineData>(visualTimeline);

  const [selection, setSelection] = useState<EditorSelection>(() => {
    const firstSceneId = editorVisualTimeline.segments[0]?.id;
    return firstSceneId ? sceneSelection(firstSceneId) : noSelection();
  });

  const selectedBlockId = getSelectedBlockId(selection);
  const selectedBlockIds = getSelectedBlockIds(selection);

  // Compatibility adapters keep the existing action modules stable while the
  // editor migrates to the single selection source of truth.
  const setSelectedBlockId = useCallback((id: string | null) => {
    setSelection(id ? blockSelection([id], id) : noSelection());
  }, []);

  const setSelectedBlockIds = useCallback(
    (nextOrUpdater: string[] | ((current: string[]) => string[])) => {
      setSelection((currentSelection) => {
        const current = getSelectedBlockIds(currentSelection);
        const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(current) : nextOrUpdater;
        return blockSelection(next);
      });
    },
    [],
  );

  const selectBlock = useCallback((id: string | null, additive = false) => {
    if (!id) {
      setSelection(noSelection());
      return;
    }

    if (!additive) {
      setSelection(blockSelection([id], id));
      return;
    }

    setSelection((currentSelection) => {
      const current = getSelectedBlockIds(currentSelection);
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      return blockSelection(next);
    });
  }, []);

  const [currentFrame, setCurrentFrame] = useState(0);

  const { runtimeTimeline, currentSegment, editorDuration } = useEditorTimelineState({
    timeline,
    editorVisualTimeline,
    currentFrame,
  });

  const setEditorSelectedBlockId = useCallback(
    (id: string | null) => {
      setSelectedBlockId(id);
    },
    [setSelectedBlockId],
  );

  const isDirty = editorVisualTimeline !== savedTimeline;

  const resolvedBlocks = useResolvedEditorBlocks({
    editorVisualTimeline,
    runtimeTimeline,
  });

  const activeBlocks = useActiveEditorBlocks({
    resolvedBlocks,
    currentFrame,
  });

  const selectedBlock = useSelectedEditorBlock(resolvedBlocks, selectedBlockId);

  const sceneActions = useEditorScenes({
    editorVisualTimeline,
    runtimeTimeline,
    runtime,
    selection,
    setSelection,
    currentFrame,
    setCurrentFrame,
    commitTimelineChange,
    sceneLabel: t.timeline.scene,
  });

  const {
    selectedSceneId,
    selectScene,
    clearSceneSelection,
    addScene,
    reorderScenes,
    duplicateScene,
    deleteScene,
    setSceneDuration,
    setSceneBackground,
  } = sceneActions;

  const editorActions = useEditorActions({
    timelineRef,
    selectedBlock,
    selectedBlockId,
    commitTimelineChange,
    setSelectedBlockId: setEditorSelectedBlockId,
    setSelectedBlockIdRaw: setSelectedBlockId,
    setSelectedBlockIds,
    selectedBlockIds,
    getSceneDurationFrames: (segmentId) =>
      runtimeTimeline.segments.find((segment) => segment.id === segmentId)?.durationFrames,
  });

  const {
    hasClipboard,
    addBlock,

    deleteSelectedBlock,
    copySelectedBlock,
    pasteBlock,
    duplicateSelectedBlock,
    groupSelectedBlocks,
    ungroupSelectedBlock,

    updateBlock,
    splitBlockAtFrame,

    moveSelectedForward,
    moveSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,

    handleMove,
    handleResize,
    handleRotate,
    handleResizeSelection,
    handleRotateSelection,
  } = editorActions;

  const { handleTimelineBlockMove, handleTimelineBlockResize, handleTimelineBlockLayerChange } =
    useEditorTimelineBlocks({
      resolvedBlocks,
      runtimeTimeline,
      editorVisualTimeline,
      updateBlock,
      commitTimelineChange,
      setSelectedBlockId,
    });

  const handleAddBlock = useCallback(
    (type: Parameters<typeof addBlock>[0]) => {
      const segment = currentSegment ?? runtimeTimeline.segments[0];

      if (!segment) {
        console.error('Cannot add block: no TTS segments');

        return;
      }

      addBlock(type, segment.id, segment.durationFrames);
    },
    [addBlock, currentSegment, runtimeTimeline],
  );

  const handleSave = useCallback(async () => {
    setSavedTimeline(editorVisualTimeline);
  }, [editorVisualTimeline]);

  const moneySuffix =
    language === 'en'
      ? '$'
      : language === 'es'
        ? '€'
        : language === 'zh'
          ? '¥'
          : language === 'hi'
            ? '₹'
            : '₽';

  const containerChildActions = useEditorContainerChildren({
    selectedBlock,
    timelineRef,
    commitTimelineChange,
    setSelectedBlockId,
    textExample: t.blocks.text.example,
    stackText: uiText(language, 'enterText') + '…',
    moneySuffix,
  });
  const { updateStackChildText } = containerChildActions;

  const { moveSelectedByKeyboard, alignSelected } = useEditorBlockArrangement(
    selectedBlockIds,
    commitTimelineChange,
  );

  const inspectorProps = createEditorInspectorProps({
    timeline,
    selectedBlock,
    selectedSceneId,
    setSelectedBlockId,
    editorVisualTimeline,
    runtimeTimeline,
    sceneActions,
    editorActions,
    editorHistory,
    containerChildActions,
    alignSelected,
  });

  useEditorKeyboard({
    selectedBlock,
    selectedBlockId,
    selectedBlockIds,

    hasClipboard,

    onUndo: () => externalUndo?.() || (undo(), true),
    onRedo: () => externalRedo?.() || (redo(), true),
    onSave: handleSave,

    onCopy: copySelectedBlock,

    onPaste: pasteBlock,

    onDuplicate: duplicateSelectedBlock,

    onDelete: deleteSelectedBlock,

    onDeleteScene: () => deleteScene(),

    onGroup: groupSelectedBlocks,

    onUngroup: ungroupSelectedBlock,

    onMoveForward: moveSelectedForward,

    onMoveBackward: moveSelectedBackward,

    onBringToFront: bringSelectedToFront,

    onSendToBack: sendSelectedToBack,

    onMoveSelected: moveSelectedByKeyboard,
  });

  return {
    /*
     * Timeline
     */

    timeline: runtimeTimeline,
    editorTimeline: editorVisualTimeline,
    runtimeTimeline,
    timelineRef,

    /*
     * Player
     */

    currentFrame,
    setCurrentFrame,
    editorDuration,

    /*
     * Blocks
     */

    resolvedBlocks,
    activeBlocks,

    selectedBlock,
    selectedBlockId,
    selectedBlockIds,
    setSelectedBlockId: setEditorSelectedBlockId,
    selectBlock,
    hasClipboard,
    alignSelected,
    groupSelectedBlocks,
    ungroupSelectedBlock,

    /*
     * Segment
     */

    currentSegment,
    selectedSceneId,
    selectScene,
    clearSceneSelection,
    addScene,
    reorderScenes,
    duplicateScene,
    deleteScene,
    setSceneDuration,
    setSceneBackground,

    /*
     * History
     */

    canUndo,
    canRedo,
    undo,
    redo,

    /*
     * Save
     */

    isDirty,
    handleSave,

    /*
     * Library
     */

    handleAddBlock,

    /*
     * Inspector
     */

    inspectorProps,

    onStackChildTextChange: updateStackChildText,

    /*
     * Canvas
     */

    handleMove,
    handleResize,
    handleRotate,
    handleResizeSelection,
    handleRotateSelection,

    /*
     * Context menu / quick actions
     */
    copySelectedBlock,
    pasteBlock,
    duplicateSelectedBlock,
    deleteSelectedBlock,
    splitBlockAtFrame,
    moveSelectedForward,
    moveSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,

    /*
     * Timeline
     */

    handleTimelineBlockMove,
    handleTimelineBlockResize,
    handleTimelineBlockLayerChange,

    /*
     * Interaction history
     */

    beginInteraction,
    endInteraction,
  };
};
