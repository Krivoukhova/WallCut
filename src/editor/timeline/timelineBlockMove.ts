import type { TTSSegment } from '../../domain/timeline/ttsTimelineTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import type { InteractionState } from './timelineTypes';
import { clamp, snapFrame } from './timelineUtils';

/**
 * Locks a move gesture to its dominant axis. Vertical drags should change the
 * track without allowing horizontal pointer jitter to transfer scenes.
 */
export function resolveTimelineDragAxis(deltaX: number, deltaY: number): 'horizontal' | 'vertical' {
  return Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
}

/** Resolves the destination scene using the dragged block's absolute left edge. */
export function findMoveTargetSegment<
  T extends Pick<TTSSegment, 'id' | 'startFrame' | 'durationFrames'>,
>(segments: T[], absoluteStartFrame: number): T | undefined {
  return segments.find((segment, index) => {
    const endFrame = segment.startFrame + segment.durationFrames;
    return (
      absoluteStartFrame >= segment.startFrame &&
      (absoluteStartFrame < endFrame || index === segments.length - 1)
    );
  });
}

/** Locate a block only inside its scene. Local block IDs may repeat across scenes. */
export function findSceneQualifiedBlockLocation<
  TSegment extends { id: string; blocks: Array<{ id?: unknown }> },
>(
  segments: TSegment[],
  segmentId: string,
  localBlockId: string,
): { segmentIndex: number; blockIndex: number } | undefined {
  const segmentIndex = segments.findIndex((segment) => segment.id === segmentId);
  if (segmentIndex < 0) return undefined;

  const blockIndex = segments[segmentIndex].blocks.findIndex(
    (block) => String(block.id ?? '') === localBlockId,
  );
  return blockIndex < 0 ? undefined : { segmentIndex, blockIndex };
}

export function isNestedTimelineBlock(editorId: string): boolean {
  return editorId.slice(editorId.indexOf(':') + 1).includes('/');
}

export function hasCrossedSceneBoundary(
  sourceSegmentId: string | undefined,
  targetSegmentId: string | undefined,
): boolean {
  return Boolean(sourceSegmentId && targetSegmentId && sourceSegmentId !== targetSegmentId);
}

export type TimelineMoveCalculationInput = {
  interaction: Pick<
    InteractionState,
    'editorId' | 'originalStartFrame' | 'originalDuration' | 'startPointerFrame'
  >;
  block: ResolvedEditorBlock;
  segments: TTSSegment[];
  pointerFrame: number;
  snapCandidates: number[];
  durationInFrames: number;
  segmentStart: number;
  segmentEnd: number;
};

export type TimelineMoveCalculation = {
  rawStart: number;
  rawTargetSegment: TTSSegment | undefined;
  crossesSceneBoundary: boolean;
  isNestedBlock: boolean;
  nextStart: number;
};

/** Pure calculation for a timeline move; state changes and callbacks stay in the hook. */
export function calculateTimelineMove({
  interaction,
  block,
  segments,
  pointerFrame,
  snapCandidates,
  durationInFrames,
  segmentStart,
  segmentEnd,
}: TimelineMoveCalculationInput): TimelineMoveCalculation {
  const delta = pointerFrame - interaction.startPointerFrame;
  const rawStart = interaction.originalStartFrame + delta;
  const snapped = snapFrame(rawStart, snapCandidates);
  const sourceSegment = segments.find((item) => item.id === block.segmentId);
  const rawTargetSegment = findMoveTargetSegment(segments, rawStart);
  const crossesSceneBoundary = hasCrossedSceneBoundary(sourceSegment?.id, rawTargetSegment?.id);
  const isNestedBlock = isNestedTimelineBlock(interaction.editorId);
  const minStart = isNestedBlock ? segmentStart : 0;
  const maxStart = isNestedBlock
    ? Math.max(segmentStart, segmentEnd - interaction.originalDuration)
    : Math.max(0, durationInFrames - interaction.originalDuration);
  const nextStart = clamp(
    crossesSceneBoundary && !isNestedBlock ? rawStart : snapped,
    minStart,
    maxStart,
  );

  return {
    rawStart,
    rawTargetSegment,
    crossesSceneBoundary,
    isNestedBlock,
    nextStart,
  };
}
