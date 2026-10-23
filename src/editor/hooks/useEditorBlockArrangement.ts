import { useCallback } from 'react';

import { getBlockMetrics } from '../../domain/layout/metrics';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

type AlignmentMode = 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom';
type CommitTimelineChange = (
  updater: (timeline: VisualTimelineData) => VisualTimelineData,
) => VisualTimelineData;

/** Keyboard movement and canvas alignment for the current block selection. */
export const useEditorBlockArrangement = (
  selectedBlockIds: string[],
  commitTimelineChange: CommitTimelineChange,
) => {
  const moveSelectedByKeyboard = useCallback(
    (dx: number, dy: number) => {
      if (selectedBlockIds.length < 1) return;

      commitTimelineChange((timeline) => ({
        ...timeline,
        segments: timeline.segments.map((segment) => ({
          ...segment,
          blocks: segment.blocks.map((block, index) => {
            const id = `${segment.id}:${block.id ?? `${block.type}-${index}`}`;
            if (!selectedBlockIds.includes(id)) return block;

            return {
              ...block,
              x: (block.x ?? 0) + dx,
              y: (block.y ?? 0) + dy,
            };
          }),
        })),
      }));
    },
    [commitTimelineChange, selectedBlockIds],
  );

  const alignSelected = useCallback(
    (mode: AlignmentMode) => {
      if (selectedBlockIds.length < 1) return;
      const canvasWidth = 1080;
      const canvasHeight = 1920;

      commitTimelineChange((timeline) => ({
        ...timeline,
        segments: timeline.segments.map((segment) => ({
          ...segment,
          blocks: segment.blocks.map((block, index) => {
            const id = `${segment.id}:${block.id ?? `${block.type}-${index}`}`;
            if (!selectedBlockIds.includes(id)) return block;

            const metrics = getBlockMetrics(block);
            const width = Math.abs(metrics.width * (block.scale ?? 1) * (block.scaleX ?? 1));
            const height = Math.abs(metrics.height * (block.scale ?? 1) * (block.scaleY ?? 1));
            const radians = ((block.rotation ?? 0) * Math.PI) / 180;
            const cos = Math.abs(Math.cos(radians));
            const sin = Math.abs(Math.sin(radians));
            const visualWidth = width * cos + height * sin;
            const visualHeight = width * sin + height * cos;
            let x = block.x ?? canvasWidth / 2;
            let y = block.y ?? canvasHeight / 2;

            if (mode === 'left') x = visualWidth / 2;
            if (mode === 'centerX') x = canvasWidth / 2;
            if (mode === 'right') x = canvasWidth - visualWidth / 2;
            if (mode === 'top') y = visualHeight / 2;
            if (mode === 'centerY') y = canvasHeight / 2;
            if (mode === 'bottom') y = canvasHeight - visualHeight / 2;

            x = Math.max(visualWidth / 2, Math.min(canvasWidth - visualWidth / 2, x));
            y = Math.max(visualHeight / 2, Math.min(canvasHeight - visualHeight / 2, y));
            return { ...block, x, y };
          }),
        })),
      }));
    },
    [commitTimelineChange, selectedBlockIds],
  );

  return { moveSelectedByKeyboard, alignSelected };
};
