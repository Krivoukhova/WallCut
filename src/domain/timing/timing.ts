import { normalizeAnimation, constrainAnimationToBlock } from '../animation/animation';

import type { AnimationValue } from '../animation/animation';

import type { VisualBlockData } from '../blocks/blockTypes';

export type BlockTiming = {
  startFrame: number;
  duration: number;
  enterDuration: number;
  exitDuration: number;
  delay: number;
  exitDelay: number;
};

const DEFAULT_BLOCK_DURATION = 45;

export function getBlockTiming(
  block: VisualBlockData,
  fallbackDuration = DEFAULT_BLOCK_DURATION,
): BlockTiming {
  const animation = normalizeAnimation(block.animation as AnimationValue | undefined);

  const startFrame = Math.max(0, block.startFrame ?? 0);

  const duration = block.duration ?? fallbackDuration;

  const constrained = constrainAnimationToBlock(animation, duration);

  return {
    startFrame,
    duration,
    enterDuration: constrained.enter !== 'none' ? constrained.duration : 0,
    exitDuration: constrained.exit !== 'none' ? constrained.exitDuration : 0,
    delay: constrained.enter !== 'none' ? constrained.delay : 0,
    exitDelay: constrained.exit !== 'none' ? constrained.exitDelay : 0,
  };
}

export function getSequenceDuration(
  children: VisualBlockData[],
  fallbackDuration = DEFAULT_BLOCK_DURATION,
): number {
  if (!children.length) {
    return fallbackDuration;
  }

  let currentFrame = 0;
  let maxEndFrame = 0;

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    const timing = getBlockTiming(child, fallbackDuration);

    const start = child.startFrame ?? currentFrame;

    const end = start + timing.duration;

    maxEndFrame = Math.max(maxEndFrame, end);

    currentFrame = end;
  }

  return Math.max(fallbackDuration, maxEndFrame);
}
