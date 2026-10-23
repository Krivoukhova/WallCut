import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import { parseEditorId } from './blockCommandOperations';

function getBlockId(block: VisualBlockData, index: number): string {
  return block.id ?? `${block.type}-${index}`;
}

export type ZIndexMoveDirection = 'forward' | 'backward' | 'front' | 'back';

type OrderedBlock = {
  block: VisualBlockData;
  index: number;
};

function getSortedBlocks(blocks: VisualBlockData[]): OrderedBlock[] {
  return blocks
    .map((block, index) => ({
      block,
      index,
    }))
    .sort((a, b) => {
      const zA = a.block.zIndex ?? 0;

      const zB = b.block.zIndex ?? 0;

      if (zA !== zB) {
        return zA - zB;
      }

      return a.index - b.index;
    });
}

function applyGlobalOrder(
  blocks: VisualBlockData[],
  orderedItems: OrderedBlock[],
): VisualBlockData[] {
  const zIndexByOriginalIndex = new Map<number, number>();

  orderedItems.forEach((item, position) => {
    zIndexByOriginalIndex.set(item.index, position);
  });

  return blocks.map((block, index) => {
    const newZIndex = zIndexByOriginalIndex.get(index);

    if (newZIndex === undefined) {
      return block;
    }

    return {
      ...block,
      zIndex: newZIndex,
    };
  });
}

export function reorderBlockToPosition(
  timeline: VisualTimelineData,
  editorId: string,
  targetIndex: number,
): VisualTimelineData {
  const parsed = parseEditorId(editorId);

  if (!parsed) {
    return timeline;
  }

  return {
    ...timeline,

    segments: timeline.segments.map((segment) => {
      if (segment.id !== parsed.segmentId) {
        return segment;
      }

      const sourceIndex = segment.blocks.findIndex(
        (block, index) => getBlockId(block, index) === parsed.blockId,
      );

      if (sourceIndex === -1) {
        return segment;
      }

      const ordered = getSortedBlocks(segment.blocks);

      const sourcePosition = ordered.findIndex(({ index }) => index === sourceIndex);

      if (sourcePosition === -1) {
        return segment;
      }

      const remaining = ordered.filter(({ index }) => index !== sourceIndex);

      const safeTargetIndex = Math.max(0, Math.min(targetIndex, remaining.length));

      const movedItem = ordered[sourcePosition];

      if (!movedItem) {
        return segment;
      }

      const reordered = [...remaining];

      reordered.splice(safeTargetIndex, 0, movedItem);

      return {
        ...segment,

        blocks: applyGlobalOrder(segment.blocks, reordered),
      };
    }),
  };
}

export function reorderBlocksInTimeline(
  timeline: VisualTimelineData,
  editorIds: string[],
  direction: ZIndexMoveDirection,
): VisualTimelineData {
  if (!editorIds.length) {
    return timeline;
  }

  const selectionsBySegment = new Map<string, Set<string>>();

  for (const editorId of editorIds) {
    const parsed = parseEditorId(editorId);
    if (!parsed || !parsed.blockId) {
      continue;
    }

    const current = selectionsBySegment.get(parsed.segmentId) ?? new Set<string>();
    current.add(parsed.blockId);
    selectionsBySegment.set(parsed.segmentId, current);
  }

  const reorderSiblings = (
    blocks: VisualBlockData[],
    selectedIds: Set<string>,
  ): VisualBlockData[] => {
    if (!selectedIds.size) {
      return blocks;
    }

    const selected = blocks
      .map((block, index) => ({
        id: getBlockId(block, index),
        index,
      }))
      .filter((item) => selectedIds.has(item.id));

    if (!selected.length) {
      return blocks;
    }

    const ordered = getSortedBlocks(blocks);
    const selectedIndexes = new Set(
      ordered
        .map((item, position) => ({ originalIndex: item.index, position }))
        .filter((item) =>
          selected.some((selectedItem) => selectedItem.index === item.originalIndex),
        )
        .map((item) => item.position),
    );

    const result = [...ordered];

    if (direction === 'forward') {
      for (let position = result.length - 2; position >= 0; position -= 1) {
        if (!selectedIndexes.has(position) || selectedIndexes.has(position + 1)) {
          continue;
        }
        const moved = result[position];
        result[position] = result[position + 1];
        result[position + 1] = moved;
      }
    } else if (direction === 'backward') {
      for (let position = 1; position < result.length; position += 1) {
        if (!selectedIndexes.has(position) || selectedIndexes.has(position - 1)) {
          continue;
        }
        const moved = result[position];
        result[position] = result[position - 1];
        result[position - 1] = moved;
      }
    } else if (direction === 'front' || direction === 'back') {
      const selectedItems = result.filter((_, position) => selectedIndexes.has(position));
      const unselectedItems = result.filter((_, position) => !selectedIndexes.has(position));
      const next =
        direction === 'front'
          ? [...unselectedItems, ...selectedItems]
          : [...selectedItems, ...unselectedItems];
      return applyGlobalOrder(blocks, next);
    }

    return applyGlobalOrder(blocks, result);
  };

  const reorderTree = (
    blocks: VisualBlockData[],
    selectedPaths: Set<string>,
    parentPath = '',
  ): VisualBlockData[] => {
    const directIds = new Set<string>();

    for (const path of selectedPaths) {
      const parts = path.split('/').filter(Boolean);
      const parent = parts.slice(0, -1).join('/');
      if (parent === parentPath && parts.length) {
        directIds.add(parts[parts.length - 1]);
      }
    }

    let next = reorderSiblings(blocks, directIds);

    next = next.map((block, index) => {
      if (!block.children?.length) {
        return block;
      }

      const id = getBlockId(block, index);
      const childParentPath = parentPath ? `${parentPath}/${id}` : id;
      const hasNestedSelection = [...selectedPaths].some((path) => {
        const prefix = `${childParentPath}/`;
        return path.startsWith(prefix);
      });

      if (!hasNestedSelection) {
        return block;
      }

      return {
        ...block,
        children: reorderTree(block.children, selectedPaths, childParentPath),
      };
    });

    return next;
  };

  return {
    ...timeline,
    segments: timeline.segments.map((segment) => {
      const selectedPaths = selectionsBySegment.get(segment.id);
      if (!selectedPaths?.size) {
        return segment;
      }

      return {
        ...segment,
        blocks: reorderTree(segment.blocks, selectedPaths),
      };
    }),
  };
}

export function reorderBlockInTimeline(
  timeline: VisualTimelineData,
  editorId: string,
  direction: ZIndexMoveDirection,
): VisualTimelineData {
  return reorderBlocksInTimeline(timeline, [editorId], direction);
}
