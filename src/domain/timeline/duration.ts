import type { VisualBlockData } from '../blocks/blockTypes';
import { getBlockTiming, getSequenceDuration } from '../timing/timing';

/** Canonical scene-duration policy. All timeline/render/editor code must use these helpers. */
export const DEFAULT_SCENE_DURATION_FRAMES = 150;
export const MIN_SCENE_DURATION_FRAMES = 15;

/** Separate default for an individual visual block; it is not a scene-duration source of truth. */
const DEFAULT_BLOCK_DURATION_FRAMES = 45;

export const resolveSceneDuration = (durationFrames: number | undefined): number =>
  Math.max(MIN_SCENE_DURATION_FRAMES, Math.round(durationFrames ?? DEFAULT_SCENE_DURATION_FRAMES));

export const getSceneStartFrame = (
  segments: ReadonlyArray<{ durationFrames?: number }>,
  index: number,
): number => {
  if (index <= 0) return 0;
  return segments
    .slice(0, index)
    .reduce((sum, segment) => sum + resolveSceneDuration(segment.durationFrames), 0);
};

export const getTimelineDuration = (segments: ReadonlyArray<{ durationFrames?: number }>): number =>
  segments.reduce((sum, segment) => sum + resolveSceneDuration(segment.durationFrames), 0);

export const getBlockDuration = (block: VisualBlockData): number => {
  if (block.type === 'sequence') {
    return getSequenceDuration(block.children ?? []);
  }

  if (block.type === 'group' || block.type === 'stack' || block.type === 'overlay') {
    const childrenDuration = block.children?.length
      ? Math.max(...block.children.map(getBlockDuration))
      : 0;

    return Math.max(childrenDuration, block.duration ?? 0, DEFAULT_BLOCK_DURATION_FRAMES);
  }

  return getBlockTiming(block, DEFAULT_BLOCK_DURATION_FRAMES).duration;
};
