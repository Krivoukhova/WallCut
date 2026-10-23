import type { VisualBlockData } from '../blocks/blockTypes';

import { normalizeAnimation } from '../animation/animation';

import { getBlockMetrics } from '../layout/metrics';

import { getBlockTiming } from '../timing/timing';

import { getAutomaticLayout } from '../layout/layoutEngine';

export type ResolvedBlock = {
  id: string;

  block: VisualBlockData;

  index: number;

  startFrame: number;
  duration: number;

  x: number;
  y: number;

  width: number;
  height: number;

  scale: number;
  scaleX: number;
  scaleY: number;

  rotation: number;

  animation: ReturnType<typeof normalizeAnimation>;
};

const DEFAULT_X = 540;
const DEFAULT_Y = 960;

const DEFAULT_SCALE = 1;
const DEFAULT_SCALE_X = 1;
const DEFAULT_SCALE_Y = 1;

const DEFAULT_ROTATION = 0;

export function resolveBlock(
  block: VisualBlockData,
  index: number,
  segmentDuration: number,
  automaticLayout?: {
    x: number;
    y: number;
  },
): ResolvedBlock {
  const timing = getBlockTiming(block, segmentDuration);

  const metrics = getBlockMetrics(block);

  const blockLayout = block.layout ?? {};

  const x = block.x ?? automaticLayout?.x ?? DEFAULT_X;

  const y = block.y ?? automaticLayout?.y ?? DEFAULT_Y;

  const scale = block.scale ?? blockLayout.scale ?? DEFAULT_SCALE;

  /*
   * Resize factors.
   *
   * Older blocks don't have scaleX/scaleY,
   * therefore they automatically get 1.
   */
  const scaleX = block.scaleX ?? DEFAULT_SCALE_X;

  const scaleY = block.scaleY ?? DEFAULT_SCALE_Y;

  const rotation = block.rotation ?? blockLayout.rotation ?? DEFAULT_ROTATION;

  const animation = normalizeAnimation(block.animation);

  const id = block.id ?? `${block.type}-${index}`;

  return {
    id,

    block: {
      ...block,

      id,

      startFrame: timing.startFrame,

      x,
      y,

      scale,
      scaleX,
      scaleY,

      rotation,
    },

    index,

    startFrame: timing.startFrame,

    duration: timing.duration,

    x,
    y,

    width: metrics.width,

    height: metrics.height,

    scale,
    scaleX,
    scaleY,

    rotation,

    animation,
  };
}

export function resolveBlocks(blocks: VisualBlockData[], segmentDuration: number): ResolvedBlock[] {
  const automaticLayout = getAutomaticLayout(blocks);

  return blocks
    .map((block, index) => {
      const automatic = automaticLayout[index];

      const resolved = resolveBlock(block, index, segmentDuration, automatic);

      if (resolved.startFrame >= segmentDuration) {
        return null;
      }

      const availableDuration = segmentDuration - resolved.startFrame;

      resolved.duration = Math.min(resolved.duration, availableDuration);

      if (resolved.duration <= 0) {
        return null;
      }

      return resolved;
    })
    .filter((block): block is ResolvedBlock => block !== null);
}
