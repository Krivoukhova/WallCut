import { useCallback, useMemo } from 'react';

import {
  createEditorController,
  type EditorControllerState,
} from '../../application/editor/EditorController';
import type { ApplicationRuntime } from '../../application/runtime/runtimeServices';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import {
  getSelectedSceneId,
  noSelection,
  type EditorSelection,
} from '../../domain/editor/selection';
import { getSceneStartFrame } from '../../domain/timeline/duration';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { EditorHistory } from '../editorHistory';

type RuntimeTimeline = {
  segments: Array<{ id: string; startFrame: number }>;
};

type UseEditorScenesProps = {
  editorVisualTimeline: VisualTimelineData;
  runtimeTimeline: RuntimeTimeline;
  runtime: ApplicationRuntime;
  selection: EditorSelection;
  setSelection: React.Dispatch<React.SetStateAction<EditorSelection>>;
  currentFrame: number;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  commitTimelineChange: EditorHistory['commitTimelineChange'];
  sceneLabel: string;
};

/** Scene-level editing operations, kept separate from block editing. */
export const useEditorScenes = ({
  editorVisualTimeline,
  runtimeTimeline,
  runtime,
  selection,
  setSelection,
  currentFrame,
  setCurrentFrame,
  commitTimelineChange,
  sceneLabel,
}: UseEditorScenesProps) => {
  const selectedSceneId = getSelectedSceneId(selection);

  const editorController = useMemo(
    () => createEditorController(commitTimelineChange, runtime.ids, runtime.clone),
    [commitTimelineChange, runtime.ids, runtime.clone],
  );

  const applyControllerState = useCallback(
    (next: EditorControllerState) => {
      setSelection(next.selection);
      setCurrentFrame(next.currentFrame);
    },
    [setSelection, setCurrentFrame],
  );

  const selectScene = useCallback(
    (sceneId: string) => {
      const next = editorController.selectScene(
        { selection, currentFrame },
        editorVisualTimeline,
        sceneId,
        (index) => runtimeTimeline.segments[index]?.startFrame ?? 0,
      );
      applyControllerState(next);
    },
    [
      applyControllerState,
      currentFrame,
      editorController,
      editorVisualTimeline,
      runtimeTimeline,
      selection,
    ],
  );

  const clearSceneSelection = useCallback(() => {
    setSelection(noSelection());
  }, [setSelection]);

  const addScene = useCallback(() => {
    const next = editorController.addScene(
      { selection, currentFrame },
      editorVisualTimeline,
      (index) => runtimeTimeline.segments[index]?.startFrame ?? 0,
      sceneLabel,
    );
    applyControllerState(next);
  }, [
    applyControllerState,
    currentFrame,
    editorController,
    editorVisualTimeline,
    runtimeTimeline,
    sceneLabel,
    selection,
  ]);

  const reorderScenes = useCallback(
    (sceneId: string, targetIndex: number) => {
      const next = editorController.reorderScenes(
        { selection, currentFrame },
        editorVisualTimeline,
        sceneId,
        targetIndex,
        (index) => getSceneStartFrame(editorVisualTimeline.segments, index),
        sceneLabel,
      );
      applyControllerState(next);
    },
    [
      applyControllerState,
      currentFrame,
      editorController,
      editorVisualTimeline,
      sceneLabel,
      selection,
    ],
  );

  const duplicateScene = useCallback(
    (sceneId?: string) => {
      const next = editorController.duplicateScene(
        { selection, currentFrame },
        editorVisualTimeline,
        sceneId ?? selectedSceneId ?? undefined,
        (index) => getSceneStartFrame(editorVisualTimeline.segments, index),
      );
      applyControllerState(next);
    },
    [
      applyControllerState,
      currentFrame,
      editorController,
      editorVisualTimeline,
      selectedSceneId,
      selection,
    ],
  );

  const deleteScene = useCallback(
    (sceneId?: string) => {
      const next = editorController.deleteScene(
        { selection, currentFrame },
        editorVisualTimeline,
        sceneId ?? selectedSceneId ?? undefined,
        (index) => getSceneStartFrame(editorVisualTimeline.segments, index),
      );
      applyControllerState(next);
    },
    [
      applyControllerState,
      currentFrame,
      editorController,
      editorVisualTimeline,
      selectedSceneId,
      selection,
    ],
  );

  const setSceneName = useCallback(
    (sceneId: string, name: string) => {
      editorController.setSceneName(sceneId, name, sceneLabel);
    },
    [editorController, sceneLabel],
  );

  const setSceneDuration = useCallback(
    (sceneId: string, durationFrames: number) => {
      editorController.setSceneDuration(editorVisualTimeline, sceneId, durationFrames);
    },
    [editorController, editorVisualTimeline],
  );

  const setSceneBackground = useCallback(
    (sceneId: string, background: BackgroundStyle | undefined) => {
      commitTimelineChange((previous) => ({
        ...previous,
        segments: previous.segments.map((segment) =>
          segment.id === sceneId ? { ...segment, background } : segment,
        ),
      }));
    },
    [commitTimelineChange],
  );

  const setSceneContentOpacity = useCallback(
    (sceneId: string, contentOpacity: number) => {
      const normalized = Math.max(0, Math.min(1, contentOpacity));
      commitTimelineChange((previous) => ({
        ...previous,
        segments: previous.segments.map((segment) =>
          segment.id === sceneId ? { ...segment, contentOpacity: normalized } : segment,
        ),
      }));
    },
    [commitTimelineChange],
  );

  return {
    selectedSceneId,
    selectScene,
    clearSceneSelection,
    addScene,
    reorderScenes,
    duplicateScene,
    deleteScene,
    setSceneName,
    setSceneDuration,
    setSceneBackground,
    setSceneContentOpacity,
  };
};
