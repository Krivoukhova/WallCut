import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import { constrainAnimationToBlock } from '../../domain/animation/animation';
import type { ResolvedEditorBlock } from '../editorTypes';

export function useEditorTimingActions(options: {
  selectedBlockId: string | null;
  selectedBlock: ResolvedEditorBlock | undefined;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const { selectedBlockId, selectedBlock, updateBlock } = options;

  const updateSelectedStartFrame = useCallback(
    (value: number) => {
      if (!selectedBlockId) return;

      const segmentDuration = selectedBlock?.segmentDuration ?? 1;
      const nextStartFrame = Math.max(
        0,
        Math.min(Math.floor(value), Math.max(0, segmentDuration - 1)),
      );

      updateBlock(selectedBlockId, (block) => {
        const maxDuration = Math.max(1, segmentDuration - nextStartFrame);
        const currentDuration = block.duration ?? maxDuration;
        const nextDuration = Math.min(maxDuration, Math.max(1, Math.floor(currentDuration)));

        return {
          ...block,
          startFrame: nextStartFrame,
          duration: nextDuration,
          animation: constrainAnimationToBlock(block.animation, nextDuration),
        };
      });
    },
    [selectedBlockId, selectedBlock, updateBlock],
  );

  const updateSelectedDuration = useCallback(
    (value: number) => {
      if (!selectedBlockId) return;

      const segmentDuration = selectedBlock?.segmentDuration ?? 1;
      const startFrame = selectedBlock?.startFrame ?? 0;
      const maxDuration = Math.max(1, segmentDuration - startFrame);
      const nextDuration = Math.max(1, Math.min(Math.floor(value), maxDuration));

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        duration: nextDuration,
        animation: constrainAnimationToBlock(block.animation, nextDuration),
      }));
    },
    [selectedBlockId, selectedBlock, updateBlock],
  );

  return {
    updateSelectedStartFrame,
    updateSelectedDuration,
  };
}
