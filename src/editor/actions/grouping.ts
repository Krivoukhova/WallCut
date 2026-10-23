import { useCallback } from 'react';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import { getBlockMetrics } from '../../domain/layout/metrics';
import { findRawBlock, cloneBlock } from '../commands/blockCommands';

type UseEditorGroupingActionsOptions = {
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  selectedBlock: ResolvedEditorBlock | undefined;
  selectedBlockIds: string[];
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
  setSelectedBlockIdRaw?: (id: string | null) => void;
  setSelectedBlockIds?: React.Dispatch<React.SetStateAction<string[]>>;
  getSceneDurationFrames?: (segmentId: string) => number | undefined;
};

export function useEditorGroupingActions({
  timelineRef,
  selectedBlock,
  selectedBlockIds,
  commitTimelineChange,
  setSelectedBlockId,
  setSelectedBlockIdRaw,
  setSelectedBlockIds,
  getSceneDurationFrames,
}: UseEditorGroupingActionsOptions) {
  const groupSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.length < 2) return;

    const parsed = selectedBlockIds
      .map((id) => ({
        id,
        parsed:
          id.indexOf(':') >= 0
            ? { segmentId: id.slice(0, id.indexOf(':')), blockId: id.slice(id.indexOf(':') + 1) }
            : null,
      }))
      .filter((item): item is { id: string; parsed: { segmentId: string; blockId: string } } =>
        Boolean(item.parsed),
      );

    if (parsed.length !== selectedBlockIds.length) return;
    const segmentId = parsed[0].parsed.segmentId;
    if (
      parsed.some(
        (item) => item.parsed.segmentId !== segmentId || item.parsed.blockId.includes('/'),
      )
    )
      return;

    const segment = timelineRef.current.segments.find((item) => item.id === segmentId);
    if (!segment) return;

    const selected = segment.blocks.filter((block, index) => {
      const id = block.id ?? `${block.type}-${index}`;
      return parsed.some((item) => item.parsed.blockId === id);
    });

    if (selected.length !== selectedBlockIds.length) return;
    // Groups are created from normal top-level blocks. Existing containers
    // stay intact and can be ungrouped separately.
    if (selected.some((block) => ['group', 'stack', 'sequence', 'overlay'].includes(block.type)))
      return;

    const getBounds = (block: VisualBlockData) => {
      const metrics = getBlockMetrics(block);
      const width = Math.max(
        1,
        (block.type === 'circle'
          ? (block.width ?? block.height ?? metrics.width)
          : (block.width ?? metrics.width)) *
          (block.scale ?? 1) *
          (block.scaleX ?? 1),
      );
      const height = Math.max(
        1,
        (block.type === 'circle'
          ? (block.width ?? block.height ?? metrics.height)
          : (block.height ?? metrics.height)) *
          (block.scale ?? 1) *
          (block.scaleY ?? 1),
      );
      const radians = ((block.rotation ?? 0) * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const visualWidth = width * cos + height * sin;
      const visualHeight = width * sin + height * cos;
      const x = block.x ?? 540;
      const y = block.y ?? 960;
      return {
        left: x - visualWidth / 2,
        right: x + visualWidth / 2,
        top: y - visualHeight / 2,
        bottom: y + visualHeight / 2,
      };
    };

    const bounds = selected.reduce(
      (acc, block) => {
        const b = getBounds(block);
        return {
          left: Math.min(acc.left, b.left),
          right: Math.max(acc.right, b.right),
          top: Math.min(acc.top, b.top),
          bottom: Math.max(acc.bottom, b.bottom),
        };
      },
      { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
    );

    const groupX = (bounds.left + bounds.right) / 2;
    const groupY = (bounds.top + bounds.bottom) / 2;
    const usedIds = new Set(
      segment.blocks.map((block, index) => block.id ?? `${block.type}-${index}`),
    );
    let groupId = 'group-1';
    let counter = 1;
    while (usedIds.has(groupId)) groupId = `group-${++counter}`;

    const selectedIds = new Set(parsed.map((item) => item.parsed.blockId));
    const firstIndex = segment.blocks.findIndex((block, index) =>
      selectedIds.has(block.id ?? `${block.type}-${index}`),
    );
    const maxZ = selected.reduce((max, block) => Math.max(max, block.zIndex ?? 0), 0);

    const children = selected.map((block, index) => ({
      ...cloneBlock(block),
      id: block.id ?? `${block.type}-${index}`,
      x: (block.x ?? 540) - groupX,
      y: (block.y ?? 960) - groupY,
      zIndex: index,
    }));

    const group: VisualBlockData = {
      id: groupId,
      type: 'group',
      x: groupX,
      y: groupY,
      width: Math.max(1, bounds.right - bounds.left),
      height: Math.max(1, bounds.bottom - bounds.top),
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      zIndex: maxZ,
      // A group is a scene-level container: its timeline clip spans the
      // whole current scene, while each child keeps its own timing.
      startFrame: 0,
      duration: getSceneDurationFrames?.(segmentId) ?? segment.durationFrames ?? 0,
      children,
    };

    commitTimelineChange((timeline) => ({
      ...timeline,
      segments: timeline.segments.map((item) => {
        if (item.id !== segmentId) return item;
        const remaining = item.blocks.filter(
          (block, index) => !selectedIds.has(block.id ?? `${block.type}-${index}`),
        );
        remaining.splice(Math.min(firstIndex, remaining.length), 0, group);
        return { ...item, blocks: remaining };
      }),
    }));

    setSelectedBlockId(`${segmentId}:${groupId}`);
  }, [
    commitTimelineChange,
    getSceneDurationFrames,
    selectedBlockIds,
    setSelectedBlockId,
    timelineRef,
  ]);

  const ungroupSelectedBlock = useCallback(() => {
    if (
      !selectedBlock ||
      selectedBlock.block.type !== 'group' ||
      selectedBlock.editorId.includes('/')
    )
      return;
    const parsed = selectedBlock.editorId.indexOf(':');
    if (parsed < 0) return;
    const segmentId = selectedBlock.editorId.slice(0, parsed);
    const groupId = selectedBlock.editorId.slice(parsed + 1);
    const raw = findRawBlock(timelineRef.current, selectedBlock.editorId);
    if (!raw || raw.block.type !== 'group') return;

    const groupX = raw.block.x ?? 540;
    const groupY = raw.block.y ?? 960;
    const groupRotation = raw.block.rotation ?? 0;
    const radians = (groupRotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const existingIds = new Set<string>();
    const collectIds = (blocks: VisualBlockData[]) => {
      for (const block of blocks) {
        existingIds.add(block.id ?? block.type);
        if (block.children?.length) collectIds(block.children);
      }
    };
    const segment = timelineRef.current.segments.find((item) => item.id === segmentId);
    if (!segment) return;
    collectIds(segment.blocks);
    existingIds.delete(groupId);

    const groupZIndex = raw.block.zIndex ?? 0;
    const children = (raw.block.children ?? []).map((child, index) => {
      let id = child.id ?? `${child.type}-${index}`;
      let suffix = 2;
      while (existingIds.has(id)) id = `${child.id ?? child.type}-ungroup-${suffix++}`;
      existingIds.add(id);
      const localX = child.x ?? 0;
      const localY = child.y ?? 0;
      return {
        ...cloneBlock(child),
        id,
        x: groupX + localX * cos - localY * sin,
        y: groupY + localX * sin + localY * cos,
        rotation: (child.rotation ?? 0) + groupRotation,
        zIndex: groupZIndex + index,
      };
    });

    const groupIndex = segment.blocks.findIndex(
      (block, index) => (block.id ?? `${block.type}-${index}`) === groupId,
    );
    if (groupIndex < 0) return;

    commitTimelineChange((timeline) => ({
      ...timeline,
      segments: timeline.segments.map((item) => {
        if (item.id !== segmentId) return item;
        const blocks = item.blocks.filter(
          (block, index) => (block.id ?? `${block.type}-${index}`) !== groupId,
        );
        blocks.splice(Math.min(groupIndex, blocks.length), 0, ...children);
        return { ...item, blocks };
      }),
    }));

    const childSelectionIds = children.map((child) => `${segmentId}:${child.id}`);
    if (setSelectedBlockIds) {
      setSelectedBlockIds(childSelectionIds);
    }
    const activeChildId = childSelectionIds.length
      ? childSelectionIds[childSelectionIds.length - 1]
      : null;
    (setSelectedBlockIdRaw ?? setSelectedBlockId)?.(activeChildId);
  }, [
    commitTimelineChange,
    selectedBlock,
    setSelectedBlockId,
    setSelectedBlockIdRaw,
    setSelectedBlockIds,
    timelineRef,
  ]);

  return { groupSelectedBlocks, ungroupSelectedBlock };
}
