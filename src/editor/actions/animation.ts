import { useCallback } from 'react';

import {
  normalizeAnimation,
  constrainAnimationToBlock,
  type AnimationPreset,
  type AnimationType,
} from '../../domain/animation/animation';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

export function useEditorAnimationActions(options: {
  selectedBlockId: string | null;
  selectedBlockDuration: number;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const { selectedBlockId, selectedBlockDuration, updateBlock } = options;

  const updateSelectedAnimation = useCallback(
    (
      updater: (
        animation: ReturnType<typeof normalizeAnimation>,
      ) => ReturnType<typeof normalizeAnimation>,
    ) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => {
        const animation = normalizeAnimation(block.animation);
        const nextAnimation = constrainAnimationToBlock(
          updater(animation),
          block.duration ?? selectedBlockDuration,
        );

        return {
          ...block,
          animation: nextAnimation,
        };
      });
    },
    [selectedBlockId, selectedBlockDuration, updateBlock],
  );

  const updateSelectedAnimationPreset = useCallback(
    (preset: AnimationPreset) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        animation: constrainAnimationToBlock(preset, block.duration ?? selectedBlockDuration),
      }));
    },
    [selectedBlockId, selectedBlockDuration, updateBlock],
  );

  const updateSelectedAnimationEnter = useCallback(
    (value: AnimationType) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        enter: value,
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationExit = useCallback(
    (value: AnimationType) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        exit: value,
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationDuration = useCallback(
    (value: number) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        duration: Math.max(1, Math.floor(value)),
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationExitDuration = useCallback(
    (value: number) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        exitDuration: Math.max(1, Math.floor(value)),
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationDelay = useCallback(
    (value: number) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        delay: Math.max(0, Math.floor(value)),
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationExitDelay = useCallback(
    (value: number) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        exitDelay: Math.max(0, Math.floor(value)),
      }));
    },
    [updateSelectedAnimation],
  );

  const updateSelectedAnimationIntensity = useCallback(
    (value: number) => {
      updateSelectedAnimation((animation) => ({
        ...animation,
        intensity: Math.max(0, value),
      }));
    },
    [updateSelectedAnimation],
  );

  return {
    updateSelectedAnimation,
    updateSelectedAnimationPreset,
    updateSelectedAnimationEnter,
    updateSelectedAnimationExit,
    updateSelectedAnimationDuration,
    updateSelectedAnimationExitDuration,
    updateSelectedAnimationDelay,
    updateSelectedAnimationExitDelay,
    updateSelectedAnimationIntensity,
  };
}
