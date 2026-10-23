import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import { findRawBlock, updateBlockInTimeline } from '../commands/blockCommands';

type UseEditorContainerChildrenOptions = {
  selectedBlock: ResolvedEditorBlock | undefined;
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
  textExample: string;
  stackText: string;
  moneySuffix: string;
};

export function useEditorContainerChildren({
  selectedBlock,
  timelineRef,
  commitTimelineChange,
  setSelectedBlockId,
  textExample,
  stackText,
  moneySuffix,
}: UseEditorContainerChildrenOptions) {
  const addSelectedContainerChild = useCallback(
    (type: VisualBlockData['type']) => {
      if (
        !selectedBlock ||
        (selectedBlock.block.type !== 'group' && selectedBlock.block.type !== 'stack')
      ) {
        return;
      }

      const parentEditorId = selectedBlock.editorId;
      const raw = findRawBlock(timelineRef.current, parentEditorId);
      if (!raw) return;

      const existingChildren = raw.block.children ?? [];
      const usedIds = new Set(
        existingChildren.map((child, index) => child.id ?? `${child.type}-${index}`),
      );
      let childIndex = existingChildren.length + 1;
      let childId = `${type}-${childIndex}`;
      while (usedIds.has(childId)) {
        childIndex += 1;
        childId = `${type}-${childIndex}`;
      }

      const child: VisualBlockData = {
        id: childId,
        type,
        layer:
          type === 'text' || type === 'number' || type === 'money'
            ? 'text'
            : type === 'image'
              ? 'other'
              : 'shape',
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        color: '#ffffff',
        startFrame: 0,
        duration: raw.block.duration ?? selectedBlock.duration ?? 1,
        animation: { enter: 'none', exit: 'none' },
      };

      switch (type) {
        case 'text':
          child.text = selectedBlock.block.type === 'stack' ? stackText : textExample;
          child.fontSize = selectedBlock.block.type === 'stack' ? 28 : 48;
          child.fontWeight = 600;
          break;
        case 'number':
          child.from = 0;
          child.to = 100;
          child.fontSize = 64;
          child.fontWeight = 700;
          break;
        case 'money':
          child.amount = 1000;
          child.suffix = moneySuffix;
          child.fontSize = 56;
          child.fontWeight = 700;
          break;
        case 'image':
          child.width = 240;
          child.height = 140;
          child.image = '';
          break;
      }

      commitTimelineChange((previousTimeline) =>
        updateBlockInTimeline(previousTimeline, parentEditorId, (parent) => {
          const nextChildren = [...(parent.children ?? []), child];
          if (parent.type !== 'stack') return { ...parent, children: nextChildren };

          const padding = parent.padding ?? 0;
          const gap = parent.gap ?? 24;
          const requiredContentHeight =
            nextChildren.reduce((total, item) => {
              switch (item.type) {
                case 'image':
                  return total + 160;
                case 'number':
                  return total + 88;
                case 'money':
                  return total + 80;
                case 'text':
                default:
                  return total + 64;
              }
            }, 0) +
            gap * Math.max(0, nextChildren.length - 1);
          const numericPadding = typeof padding === 'number' ? padding : Number(padding ?? 0) || 0;
          const requiredHeight = numericPadding * 2 + requiredContentHeight;

          return {
            ...parent,
            children: nextChildren,
            direction: parent.direction ?? 'vertical',
            gap,
            height: Math.max(parent.height ?? 400, requiredHeight),
          };
        }),
      );

      setSelectedBlockId(`${raw.segmentId}:${raw.block.id}/${childId}`);
    },
    [
      selectedBlock,
      timelineRef,
      commitTimelineChange,
      setSelectedBlockId,
      textExample,
      stackText,
      moneySuffix,
    ],
  );

  const updateStackChildText = useCallback(
    (childId: string, text: string) => {
      if (!selectedBlock) return;
      const parentEditorId =
        selectedBlock.block.type === 'stack'
          ? selectedBlock.editorId
          : selectedBlock.editorId.split('/').slice(0, -1).join('/');
      if (!parentEditorId) return;

      const childEditorId = `${parentEditorId}/${childId}`;
      commitTimelineChange((previousTimeline) =>
        updateBlockInTimeline(previousTimeline, childEditorId, (child) => ({ ...child, text })),
      );
    },
    [selectedBlock, commitTimelineChange],
  );

  return { addSelectedContainerChild, updateStackChildText };
}
