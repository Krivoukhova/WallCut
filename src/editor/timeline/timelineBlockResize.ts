import type { ResolvedEditorBlock } from '../editorTypes';
import type { TTSSegment } from '../../domain/timeline/ttsTimelineTypes';
import { MIN_DURATION_FRAMES } from './timelineConstants';
import { clamp, snapFrame } from './timelineUtils';

export type SegmentFrameBounds = {
  start: number;
  end: number;
};

/** Resolve absolute frame bounds for a segment, retaining the legacy fallback for orphaned blocks. */
export function getSegmentFrameBounds(
  segment: Pick<TTSSegment, 'startFrame' | 'durationFrames'> | undefined,
  block: Pick<ResolvedEditorBlock, 'absoluteStartFrame' | 'segmentDuration' | 'block'>,
): SegmentFrameBounds {
  const start =
    segment?.startFrame ?? Math.max(0, block.absoluteStartFrame - (block.block.startFrame ?? 0));

  return {
    start,
    end: segment ? segment.startFrame + segment.durationFrames : start + block.segmentDuration,
  };
}

export type ResizeCalculationInput = {
  originalStartFrame: number;
  originalDuration: number;
  pointerFrame: number;
  startPointerFrame: number;
  snapCandidates: number[];
};

export function calculateLeftResize(
  input: ResizeCalculationInput & { segmentStart: number; segmentEnd: number },
): { startFrame: number; duration: number } {
  const originalEnd = input.originalStartFrame + input.originalDuration;
  const rawStart = input.originalStartFrame + (input.pointerFrame - input.startPointerFrame);
  const snappedStart = snapFrame(rawStart, input.snapCandidates);
  const startFrame = clamp(
    snappedStart,
    input.segmentStart,
    Math.min(input.segmentEnd, originalEnd - MIN_DURATION_FRAMES),
  );

  return { startFrame, duration: originalEnd - startFrame };
}

export function calculateRightResize(input: ResizeCalculationInput & { segmentEnd: number }): {
  startFrame: number;
  duration: number;
} {
  const originalEnd = input.originalStartFrame + input.originalDuration;
  const rawEnd = originalEnd + (input.pointerFrame - input.startPointerFrame);
  const snappedEnd = snapFrame(rawEnd, input.snapCandidates);
  const endFrame = clamp(
    snappedEnd,
    input.originalStartFrame + MIN_DURATION_FRAMES,
    input.segmentEnd,
  );

  return {
    startFrame: input.originalStartFrame,
    duration: endFrame - input.originalStartFrame,
  };
}
