import {
  blockSelection,
  getSelectedBlockIds,
  noSelection,
  sceneSelection,
  type EditorSelection,
} from '../../domain/editor/selection';
import {
  DEFAULT_SCENE_DURATION_FRAMES,
  resolveSceneDuration,
} from '../../domain/timeline/duration';
import type {
  VisualTimelineData,
  VisualTimelineSegment,
} from '../../domain/timeline/visualTimelineTypes';
import type { IdGenerator, CloneService } from '../runtime/runtimeServices';

export type EditorControllerState = {
  selection: EditorSelection;
  currentFrame: number;
};

export type TimelineCommit = (
  updater: (previous: VisualTimelineData) => VisualTimelineData,
) => VisualTimelineData;

export const createEditorController = (
  commitTimelineChange: TimelineCommit,
  ids: IdGenerator,
  clone: CloneService,
) => {
  const selectBlock = (
    state: EditorControllerState,
    id: string | null,
    additive = false,
  ): EditorControllerState => {
    if (!id) return { ...state, selection: noSelection() };
    if (!additive) return { ...state, selection: blockSelection([id], id) };

    const current = getSelectedBlockIds(state.selection);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

    return { ...state, selection: blockSelection(next) };
  };

  const selectScene = (
    state: EditorControllerState,
    timeline: VisualTimelineData,
    sceneId: string,
    runtimeStartFrame: (sceneIndex: number) => number,
  ): EditorControllerState => {
    const index = timeline.segments.findIndex((segment) => segment.id === sceneId);
    if (index < 0) return state;
    return { selection: sceneSelection(sceneId), currentFrame: runtimeStartFrame(index) };
  };

  const addScene = (
    state: EditorControllerState,
    _timeline: VisualTimelineData,
    runtimeStartFrame: (sceneIndex: number) => number,
    sceneLabel = 'Scene',
  ): EditorControllerState => {
    const id = ids.generate();
    let added = false;
    const next = commitTimelineChange((previous) => {
      const usedSceneNumbers = new Set<number>();
      previous.segments.forEach((segment, index) => {
        // The scene list displays a generated name when the stored name is empty.
        // Reserve that displayed number too, otherwise a project with unnamed scenes
        // shown as "Scene 1", "Scene 2", "Scene 3" would create another "Scene 1".
        const name = segment.name?.trim() || `${sceneLabel} ${index + 1}`;
        // Existing projects may contain names from another UI language or legacy labels.
        // Reserve the trailing number from any numbered scene name, not only the current locale.
        const match = /^(?:.*?\s)?(\d+)$/.exec(name);
        if (match) usedSceneNumbers.add(Number(match[1]));
      });
      let nextSceneNumber = 1;
      while (usedSceneNumbers.has(nextSceneNumber)) nextSceneNumber += 1;

      const nextSegment: VisualTimelineSegment = {
        id,
        name: `${sceneLabel} ${nextSceneNumber}`,
        blocks: [],
        durationFrames: DEFAULT_SCENE_DURATION_FRAMES,
      };
      added = true;
      return { ...previous, segments: [...previous.segments, nextSegment] };
    });

    if (!added) return state;
    const insertIndex = next.segments.findIndex((segment) => segment.id === id);
    return { selection: sceneSelection(id), currentFrame: runtimeStartFrame(insertIndex) };
  };

  const reorderScenes = (
    state: EditorControllerState,
    _timeline: VisualTimelineData,
    sceneId: string,
    targetIndex: number,
    runtimeStartFrame: (sceneIndex: number) => number,
    sceneLabel = 'Scene',
  ): EditorControllerState => {
    let moved = false;
    const next = commitTimelineChange((previous) => {
      const sourceIndex = previous.segments.findIndex((segment) => segment.id === sceneId);
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= previous.segments.length ||
        sourceIndex === targetIndex
      ) {
        return previous;
      }

      const segments = previous.segments.map((segment, index) => ({
        ...segment,
        name: segment.name?.trim() || `${sceneLabel} ${index + 1}`,
      }));
      const [segment] = segments.splice(sourceIndex, 1);
      if (!segment) return previous;
      segments.splice(Math.min(targetIndex, segments.length), 0, segment);
      moved = true;
      return { ...previous, segments };
    });

    if (!moved) return state;
    const nextSceneIndex = next.segments.findIndex((segment) => segment.id === sceneId);
    return { selection: sceneSelection(sceneId), currentFrame: runtimeStartFrame(nextSceneIndex) };
  };

  const duplicateScene = (
    state: EditorControllerState,
    _timeline: VisualTimelineData,
    sceneId: string | undefined,
    runtimeStartFrame: (sceneIndex: number) => number,
    sceneLabel = 'Сцена',
    copyLabel = 'копия',
  ): EditorControllerState => {
    if (!sceneId) return state;
    const id = ids.generate();
    let duplicated = false;
    const next = commitTimelineChange((previous) => {
      const sourceIndex = previous.segments.findIndex((segment) => segment.id === sceneId);
      if (sourceIndex < 0) return previous;
      const source = previous.segments[sourceIndex];
      const duplicate: VisualTimelineSegment = {
        ...clone.clone(source),
        id,
        name: `${source.name || `${sceneLabel} ${sourceIndex + 1}`} ${copyLabel}`,
        blocks: clone.clone(source.blocks),
      };
      duplicated = true;
      return {
        ...previous,
        segments: [
          ...previous.segments.slice(0, sourceIndex + 1),
          duplicate,
          ...previous.segments.slice(sourceIndex + 1),
        ],
      };
    });

    if (!duplicated) return state;
    const nextSceneIndex = next.segments.findIndex((segment) => segment.id === id);
    return {
      ...state,
      selection: sceneSelection(id),
      currentFrame: runtimeStartFrame(nextSceneIndex),
    };
  };

  const deleteScene = (
    state: EditorControllerState,
    _timeline: VisualTimelineData,
    sceneId: string | undefined,
    runtimeStartFrame: (sceneIndex: number) => number,
  ): EditorControllerState => {
    if (!sceneId) return state;
    let deleted = false;
    const next = commitTimelineChange((previous) => {
      if (previous.segments.length <= 1) return previous;
      if (!previous.segments.some((segment) => segment.id === sceneId)) return previous;
      deleted = true;
      return {
        ...previous,
        segments: previous.segments.filter((segment) => segment.id !== sceneId),
      };
    });

    if (!deleted) return state;
    const nextIndex = Math.min(
      next.segments.findIndex((segment) => segment.id === sceneId),
      next.segments.length - 1,
    );
    const safeIndex = nextIndex < 0 ? 0 : nextIndex;
    const nextScene = next.segments[safeIndex];
    return {
      selection: nextScene?.id ? sceneSelection(nextScene.id) : noSelection(),
      currentFrame: runtimeStartFrame(safeIndex),
    };
  };

  const setSceneName = (sceneId: string, name: string, sceneLabel = 'Scene') => {
    const nextName = name.trim().slice(0, 80);
    commitTimelineChange((previous) => ({
      ...previous,
      segments: previous.segments.map((segment, index) =>
        segment.id === sceneId
          ? { ...segment, name: nextName || `${sceneLabel} ${index + 1}` }
          : segment,
      ),
    }));
  };

  const setSceneDuration = (
    _timeline: VisualTimelineData,
    sceneId: string,
    durationFrames: number,
  ) => {
    const nextDuration = resolveSceneDuration(durationFrames);
    commitTimelineChange((previous) => {
      const index = previous.segments.findIndex((segment) => segment.id === sceneId);
      if (index < 0) return previous;
      const currentDuration = resolveSceneDuration(previous.segments[index].durationFrames);
      if (currentDuration === nextDuration) return previous;
      return {
        ...previous,
        segments: previous.segments.map((segment, segmentIndex) => {
          if (segmentIndex !== index) return segment;

          // Progress bars that currently span the whole scene should keep doing
          // so when the scene is resized. An explicitly shorter duration (for
          // example 20 frames) is a user override and must remain untouched.
          const blocks = segment.blocks.map((block) => {
            if (block.type !== 'progress' && block.type !== 'bar') return block;
            const blockDuration = block.duration;
            if (blockDuration == null || Math.round(blockDuration) === currentDuration) {
              return { ...block, duration: nextDuration };
            }
            return block;
          });

          return { ...segment, durationFrames: nextDuration, blocks };
        }),
      };
    });
  };

  return {
    selectBlock,
    selectScene,
    addScene,
    reorderScenes,
    duplicateScene,
    deleteScene,
    setSceneName,
    setSceneDuration,
  };
};
