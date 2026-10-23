import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

import type { ResolvedEditorBlock } from '../editorTypes';

export function parseEditorId(editorId: string) {
  const separator = editorId.indexOf(':');

  if (separator === -1) {
    return null;
  }

  return {
    segmentId: editorId.slice(0, separator),

    blockId: editorId.slice(separator + 1),
  };
}

function getBlockId(block: VisualBlockData, index: number): string {
  return block.id ?? `${block.type}-${index}`;
}

export function findRawBlock(
  timeline: VisualTimelineData,
  editorId: string,
): {
  segmentId: string;
  block: VisualBlockData;
} | null {
  const parsed = parseEditorId(editorId);

  if (!parsed) {
    return null;
  }

  const segment = timeline.segments.find((item) => item.id === parsed.segmentId);

  if (!segment) {
    return null;
  }

  const path = parsed.blockId.split('/').filter(Boolean);

  if (!path.length) {
    return null;
  }

  const findIn = (blocks: VisualBlockData[], ids: string[]): VisualBlockData | null => {
    if (!ids.length) {
      return null;
    }

    const index = blocks.findIndex((block, blockIndex) => getBlockId(block, blockIndex) === ids[0]);

    if (index === -1) {
      return null;
    }

    const block = blocks[index];

    if (ids.length === 1) {
      return block;
    }

    return findIn(block.children ?? [], ids.slice(1));
  };

  const block = findIn(segment.blocks, path);

  if (!block) {
    return null;
  }

  return {
    segmentId: segment.id,
    block,
  };
}

function collectBlockIds(blocks: VisualBlockData[], result: Set<string>): void {
  blocks.forEach((block, index) => {
    result.add(getBlockId(block, index));

    if (block.children?.length) {
      collectBlockIds(block.children, result);
    }
  });
}

export function generateUniqueBlockId(
  timeline: VisualTimelineData,
  segmentId: string,
  baseId: string,
): string {
  const segment = timeline.segments.find((item) => item.id === segmentId);

  if (!segment) {
    return baseId;
  }

  // IDs must be unique across the segment's entire nested block tree.
  const existingIds = new Set<string>();

  collectBlockIds(segment.blocks, existingIds);

  if (!existingIds.has(baseId)) {
    return baseId;
  }

  let counter = 2;

  while (existingIds.has(`${baseId}-copy-${counter}`)) {
    counter++;
  }

  return `${baseId}-copy-${counter}`;
}

export function cloneBlock(block: VisualBlockData): VisualBlockData {
  return structuredClone(block);
}

export function updateBlockInTimeline(
  timeline: VisualTimelineData,
  editorId: string,
  updater: (block: VisualBlockData) => VisualBlockData,
): VisualTimelineData {
  const parsed = parseEditorId(editorId);

  if (!parsed) {
    return timeline;
  }

  const path = parsed.blockId.split('/').filter(Boolean);

  if (!path.length) {
    return timeline;
  }

  // Stop after the first exact path match so duplicate legacy IDs cannot update multiple blocks.
  const updateIn = (
    blocks: VisualBlockData[],
    ids: string[],
    state: {
      changed: boolean;
    },
  ): VisualBlockData[] => {
    if (!ids.length || state.changed) {
      return blocks;
    }

    return blocks.map((block, index) => {
      if (state.changed) {
        return block;
      }

      const id = getBlockId(block, index);

      if (id !== ids[0]) {
        return block;
      }

      if (ids.length === 1) {
        state.changed = true;

        return updater(block);
      }

      const children = block.children ?? [];

      const nextChildren = updateIn(children, ids.slice(1), state);

      if (nextChildren === children) {
        return block;
      }

      return {
        ...block,
        children: nextChildren,
      };
    });
  };

  const state = {
    changed: false,
  };

  return {
    ...timeline,

    segments: timeline.segments.map((segment) => {
      if (segment.id !== parsed.segmentId) {
        return segment;
      }

      const blocks = updateIn(segment.blocks, path, state);

      return {
        ...segment,
        blocks,
      };
    }),
  };
}

export function deleteBlockFromTimeline(
  timeline: VisualTimelineData,
  editorId: string,
): VisualTimelineData {
  const parsed = parseEditorId(editorId);

  if (!parsed) {
    return timeline;
  }

  const path = parsed.blockId.split('/').filter(Boolean);

  if (!path.length) {
    return timeline;
  }

  // Delete only the block addressed by the complete nested path.
  const deleteIn = (
    blocks: VisualBlockData[],
    ids: string[],
    state: {
      deleted: boolean;
    },
  ): VisualBlockData[] => {
    if (!ids.length || state.deleted) {
      return blocks;
    }

    if (ids.length === 1) {
      const index = blocks.findIndex(
        (block, blockIndex) => getBlockId(block, blockIndex) === ids[0],
      );

      if (index === -1) {
        return blocks;
      }

      state.deleted = true;

      return [...blocks.slice(0, index), ...blocks.slice(index + 1)];
    }

    return blocks.map((block, index) => {
      if (state.deleted) {
        return block;
      }

      const id = getBlockId(block, index);

      if (id !== ids[0]) {
        return block;
      }

      const children = block.children ?? [];

      const nextChildren = deleteIn(children, ids.slice(1), state);

      if (nextChildren === children) {
        return block;
      }

      return {
        ...block,
        children: nextChildren,
      };
    });
  };

  const state = {
    deleted: false,
  };

  return {
    ...timeline,

    segments: timeline.segments.map((segment) => {
      if (segment.id !== parsed.segmentId) {
        return segment;
      }

      return {
        ...segment,

        blocks: deleteIn(segment.blocks, path, state),
      };
    }),
  };
}

export function insertBlockIntoTimeline(
  timeline: VisualTimelineData,
  segmentId: string,
  block: VisualBlockData,
): VisualTimelineData {
  return {
    ...timeline,

    segments: timeline.segments.map((segment) => {
      if (segment.id !== segmentId) {
        return segment;
      }

      return {
        ...segment,

        blocks: [...segment.blocks, block],
      };
    }),
  };
}

export function duplicateBlockInTimeline(
  timeline: VisualTimelineData,
  selectedBlock: ResolvedEditorBlock,
): {
  timeline: VisualTimelineData;
  editorId: string;
} | null {
  const found = findRawBlock(timeline, selectedBlock.editorId);

  if (!found) {
    return null;
  }

  const copied = cloneBlock(found.block);

  const baseId = copied.id ?? `${copied.type}-copy`;

  const newId = generateUniqueBlockId(timeline, found.segmentId, `${baseId}-copy`);

  copied.id = newId;

  copied.x = (copied.x ?? selectedBlock.x) + 40;

  copied.y = (copied.y ?? selectedBlock.y) + 40;

  // Assign a z-index above every existing block so the duplicate appears on top.
  const segment = timeline.segments.find((item) => item.id === found.segmentId);

  const getMaxZIndex = (blocks: VisualBlockData[]): number => {
    let max = 0;

    blocks.forEach((block) => {
      max = Math.max(max, block.zIndex ?? 0);

      if (block.children?.length) {
        max = Math.max(max, getMaxZIndex(block.children));
      }
    });

    return max;
  };

  copied.zIndex = segment ? getMaxZIndex(segment.blocks) + 1 : 1;

  // Duplicates are inserted at the segment level; nested duplication is handled separately.
  return {
    timeline: insertBlockIntoTimeline(timeline, found.segmentId, copied),

    editorId: `${found.segmentId}:${newId}`,
  };
}

/** Split a visual block into two sibling clips at a local scene frame. */
export function splitBlockInTimeline(
  timeline: VisualTimelineData,
  editorId: string,
  splitFrame: number,
): VisualTimelineData {
  const parsed = parseEditorId(editorId);
  if (!parsed) return timeline;

  const path = parsed.blockId.split('/').filter(Boolean);
  if (!path.length) return timeline;

  const changed = { value: false };

  const splitIn = (
    blocks: VisualBlockData[],
    ids: string[],
    parentStartFrame: number,
  ): VisualBlockData[] => {
    if (!ids.length || changed.value) return blocks;

    return blocks.flatMap((block, index) => {
      if (changed.value) return [block];

      const id = getBlockId(block, index);
      if (id !== ids[0]) return [block];

      const localStart = Math.max(0, block.startFrame ?? 0);
      const absoluteStart = parentStartFrame + localStart;

      if (ids.length > 1) {
        const children = splitIn(block.children ?? [], ids.slice(1), absoluteStart);
        return changed.value ? [{ ...block, children }] : [block];
      }

      const duration = Math.max(1, block.duration ?? 45);
      const absoluteEnd = absoluteStart + duration;
      const cut = Math.round(splitFrame);

      if (cut <= absoluteStart || cut >= absoluteEnd) {
        return [block];
      }

      const firstDuration = cut - absoluteStart;
      const secondDuration = absoluteEnd - cut;
      const secondLocalStart = localStart + firstDuration;

      const first = cloneBlock(block);
      const second = cloneBlock(block);

      first.id = id;
      first.startFrame = localStart;
      first.duration = firstDuration;

      second.id = generateUniqueBlockId(timeline, parsed.segmentId, `${id}-split`);
      second.startFrame = secondLocalStart;
      second.duration = secondDuration;

      changed.value = true;
      return [first, second];
    });
  };

  const segments = timeline.segments.map((segment) => {
    if (segment.id !== parsed.segmentId) return segment;

    return {
      ...segment,
      blocks: splitIn(segment.blocks, path, 0),
    };
  });

  return changed.value ? { ...timeline, segments } : timeline;
}
