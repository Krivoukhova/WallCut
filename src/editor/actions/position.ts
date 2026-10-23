import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

export function useEditorPositionActions(options: {
  selectedBlockId: string | null;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const { selectedBlockId, updateBlock } = options;

  const updateSelectedPosition = useCallback(
    (field: 'x' | 'y', value: number) => {
      if (!selectedBlockId) {
        return;
      }

      updateBlock(selectedBlockId, (block) => ({
        ...block,
        [field]: value,
      }));
    },
    [selectedBlockId, updateBlock],
  );

  return {
    updateSelectedPosition,
  };
}
