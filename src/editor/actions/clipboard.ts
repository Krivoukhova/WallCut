import { useCallback, useRef } from 'react';

import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ResolvedEditorBlock, EditorClipboard } from '../editorTypes';
import {
  cloneBlock,
  duplicateBlockInTimeline,
  findRawBlock,
  generateUniqueBlockId,
} from '../commands/blockCommands';

type UseEditorClipboardActionsOptions = {
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  selectedBlock: ResolvedEditorBlock | undefined;
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
};

export function useEditorClipboardActions({
  timelineRef,
  selectedBlock,
  commitTimelineChange,
  setSelectedBlockId,
}: UseEditorClipboardActionsOptions) {
  const clipboardRef = useRef<EditorClipboard | null>(null);

  const copySelectedBlock = useCallback(() => {
    if (!selectedBlock) return;

    const found = findRawBlock(timelineRef.current, selectedBlock.editorId);
    if (!found) return;

    clipboardRef.current = {
      block: cloneBlock(found.block),
      segmentId: found.segmentId,
    };
  }, [selectedBlock, timelineRef]);

  const pasteBlock = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (!clipboard) return;

    const currentTimeline = timelineRef.current;
    let targetSegmentId = clipboard.segmentId;
    const sourceSegment = currentTimeline.segments.find(
      (segment) => segment.id === targetSegmentId,
    );

    if (!sourceSegment) {
      if (!selectedBlock) return;
      targetSegmentId = selectedBlock.segmentId;
    }

    const copiedBlock = cloneBlock(clipboard.block);
    const baseId = copiedBlock.id ?? String(copiedBlock.type) + '-copy';
    const newId = generateUniqueBlockId(currentTimeline, targetSegmentId, String(baseId) + '-copy');

    copiedBlock.id = newId;
    copiedBlock.x = (copiedBlock.x ?? selectedBlock?.x ?? 540) + 40;
    copiedBlock.y = (copiedBlock.y ?? selectedBlock?.y ?? 960) + 40;

    commitTimelineChange((previousTimeline) => ({
      ...previousTimeline,
      segments: previousTimeline.segments.map((segment) => {
        if (segment.id !== targetSegmentId) return segment;
        return { ...segment, blocks: [...segment.blocks, copiedBlock] };
      }),
    }));

    const newEditorId = String(targetSegmentId) + ':' + String(newId);
    setSelectedBlockId(newEditorId);
  }, [selectedBlock, timelineRef, commitTimelineChange, setSelectedBlockId]);

  const duplicateSelectedBlock = useCallback(() => {
    if (!selectedBlock) return;

    const result = duplicateBlockInTimeline(timelineRef.current, selectedBlock);
    if (!result) return;

    commitTimelineChange(() => result.timeline);
    setSelectedBlockId(result.editorId);

    const found = findRawBlock(result.timeline, result.editorId);
    if (found) {
      clipboardRef.current = {
        block: cloneBlock(found.block),
        segmentId: found.segmentId,
      };
    }
  }, [selectedBlock, timelineRef, commitTimelineChange, setSelectedBlockId]);

  return {
    clipboardRef,
    hasClipboard: clipboardRef.current !== null,
    copySelectedBlock,
    pasteBlock,
    duplicateSelectedBlock,
  };
}
