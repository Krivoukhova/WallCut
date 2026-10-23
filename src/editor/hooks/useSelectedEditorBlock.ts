import { useMemo } from 'react';

import { resolveBlock } from '../../domain/resolution/blockResolver';
import type { ResolvedEditorBlock } from '../editorTypes';

/** Resolves the selected block, including children rendered inside StackBlock. */
export const useSelectedEditorBlock = (
  resolvedBlocks: ResolvedEditorBlock[],
  selectedBlockId: string | null,
): ResolvedEditorBlock | undefined =>
  useMemo(() => {
    if (!selectedBlockId) {
      return undefined;
    }

    const direct = resolvedBlocks.find((block) => block.editorId === selectedBlockId);

    if (direct) {
      return direct;
    }

    // Stack children are rendered by StackBlock itself and therefore
    // are intentionally not part of the normal resolved/rendered list.
    // Resolve a selected Stack child only for Inspector/editor actions.
    const separator = selectedBlockId.indexOf(':');
    if (separator < 0) {
      return undefined;
    }

    const segmentId = selectedBlockId.slice(0, separator);
    const path = selectedBlockId.slice(separator + 1);
    const slash = path.indexOf('/');
    if (slash < 0) {
      return undefined;
    }

    const parentId = path.slice(0, slash);
    const childId = path.slice(slash + 1);

    const parent = resolvedBlocks.find(
      (block) =>
        block.segmentId === segmentId && block.id === parentId && block.block.type === 'stack',
    );

    if (!parent) {
      return undefined;
    }

    const child = parent.block.children?.find((candidate) => candidate.id === childId);

    if (!child) {
      return undefined;
    }

    const childResolved = resolveBlock(child, parent.index, parent.segmentDuration);

    return {
      ...childResolved,
      // Stack children live in the Stack's local coordinate system.
      // Keep the parent world position for Inspector/selection bounds.
      x: parent.x,
      y: parent.y,
      block: {
        ...childResolved.block,
        x: parent.x,
        y: parent.y,
      },
      editorId: selectedBlockId,
      segmentId,
      segmentDuration: parent.segmentDuration,
      absoluteStartFrame: parent.absoluteStartFrame,
    } as ResolvedEditorBlock;
  }, [resolvedBlocks, selectedBlockId]);
