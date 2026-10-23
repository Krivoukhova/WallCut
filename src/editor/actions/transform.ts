import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

import type { ResolvedEditorBlock } from '../editorTypes';

export function useEditorTransformActions({
  selectedBlockId,
  selectedBlock,
  updateBlock,
}: {
  selectedBlockId: string | null;
  selectedBlock: ResolvedEditorBlock | undefined;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const updateSelectedScale = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      const nextScale = Math.max(0.01, value);

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        scale: nextScale,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedScaleX = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      const nextScaleX = Math.max(0.01, value);

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        scaleX: nextScaleX,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedScaleY = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      const nextScaleY = Math.max(0.01, value);

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        scaleY: nextScaleY,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedRotation = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        rotation: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  const updateSelectedOpacity = useCallback(
    (value: number) => {
      if (!selectedBlockId) {
        return;
      }

      const nextOpacity = Math.min(1, Math.max(0, value));

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        opacity: nextOpacity,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  void selectedBlock;

  return {
    updateSelectedScale,
    updateSelectedScaleX,
    updateSelectedScaleY,
    updateSelectedRotation,
    updateSelectedOpacity,
  };
}
