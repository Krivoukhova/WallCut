import { useMemo } from 'react';

import type { ResolvedEditorBlock } from '../editorTypes';

type UseActiveEditorBlocksProps = {
  resolvedBlocks: ResolvedEditorBlock[];
  currentFrame: number;
};

/** Returns blocks whose timeline interval contains the current frame. */
export const useActiveEditorBlocks = ({
  resolvedBlocks,
  currentFrame,
}: UseActiveEditorBlocksProps): ResolvedEditorBlock[] => {
  return useMemo(
    () =>
      resolvedBlocks.filter((block) => {
        const start = block.absoluteStartFrame;
        const end = start + block.duration;

        return currentFrame >= start && currentFrame < end;
      }),
    [resolvedBlocks, currentFrame],
  );
};
