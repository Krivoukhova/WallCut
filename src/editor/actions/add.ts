import { useCallback } from 'react';

import { useI18n } from '../i18n/I18nContext';
import type { MutableRefObject } from 'react';

import { findFreeBlockPosition } from '../blockPlacement';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';

import { generateUniqueBlockId, insertBlockIntoTimeline } from '../commands/blockCommands';
import { createDefaultEditorBlock } from './blockDefaults';

export function useEditorAddActions(options: {
  timelineRef: MutableRefObject<VisualTimelineData>;
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
}) {
  const { timelineRef, commitTimelineChange, setSelectedBlockId } = options;

  const { language, translations } = useI18n();

  const addBlock = useCallback(
    (type: VisualBlockData['type'], segmentId: string, segmentDurationFrames: number) => {
      const segment = timelineRef.current.segments.find((item) => item.id === segmentId);

      if (!segment) {
        return;
      }

      const existingBlocks = segment.blocks;

      const maxZIndex = existingBlocks.reduce((max, block) => Math.max(max, block.zIndex ?? 0), 0);

      const blockId = generateUniqueBlockId(timelineRef.current, segmentId, type);

      const baseBlock: VisualBlockData = {
        id: blockId,
        type,
        layer: 'other',
        zIndex: maxZIndex + 1,

        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,

        color: '#cccccc',
        opacity: 1,

        startFrame: 0,
        duration: segmentDurationFrames,
      };

      let block = createDefaultEditorBlock({
        type,
        baseBlock,
        language,
        translations,
      });

      const position = findFreeBlockPosition(block, existingBlocks);

      block = {
        ...block,
        x: position.x,
        y: position.y,
      };

      const nextTimeline = insertBlockIntoTimeline(timelineRef.current, segmentId, block);

      commitTimelineChange(() => nextTimeline);

      setSelectedBlockId(`${segmentId}:${blockId}`);
    },
    [timelineRef, commitTimelineChange, setSelectedBlockId, language, translations],
  );

  return {
    addBlock,
  };
}
