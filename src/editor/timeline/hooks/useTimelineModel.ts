import { useCallback, useMemo } from 'react';

import type { ResolvedEditorBlock } from '../../editorTypes';
import type { TTSSegment } from '../../../domain/timeline/ttsTimelineTypes';
import type { TrackId } from '../timelineTypes';

import { LABEL_WIDTH, TRACK_IDS } from '../timelineConstants';

import { clamp, getTrackId, buildSubTracks } from '../timelineUtils';

type UseTimelineModelOptions = {
  blocks: ResolvedEditorBlock[];
  segments: TTSSegment[];
  durationInFrames: number;
  currentFrame: number;
  windowWidth: number;
  labelWidth?: number;
};

export function useTimelineModel({
  blocks,
  segments,
  durationInFrames,
  currentFrame,
  windowWidth,
  labelWidth = LABEL_WIDTH,
}: UseTimelineModelOptions) {
  const frameWidth = useMemo(() => {
    const availableWidth = Math.max(700, windowWidth - labelWidth - 80);

    const minimumFrameWidth = 0.5;

    return Math.max(
      minimumFrameWidth,
      durationInFrames > 0 ? availableWidth / durationInFrames : minimumFrameWidth,
    );
  }, [durationInFrames, windowWidth, labelWidth]);

  const frameToX = useCallback((frame: number) => frame * frameWidth, [frameWidth]);

  const xToFrame = useCallback((x: number) => x / frameWidth, [frameWidth]);

  const blocksByTrack = useMemo(() => {
    const map: Record<TrackId, ResolvedEditorBlock[]> = {
      background: [],
      image: [],
      character: [],
      text: [],
      shape: [],
      other: [],
    };

    for (const block of blocks) {
      map[getTrackId(block)].push(block);
    }

    for (const trackId of TRACK_IDS) {
      map[trackId].sort(
        (a, b) =>
          a.absoluteStartFrame - b.absoluteStartFrame ||
          (a.block.zIndex ?? 0) - (b.block.zIndex ?? 0) ||
          a.index - b.index,
      );
    }

    return map;
  }, [blocks]);

  const subTracksByTrack = useMemo(() => {
    const result: Record<TrackId, ReturnType<typeof buildSubTracks>> = {
      background: [],
      image: [],
      character: [],
      text: [],
      shape: [],
      other: [],
    };

    for (const trackId of TRACK_IDS) {
      result[trackId] = buildSubTracks(blocksByTrack[trackId]);
    }

    return result;
  }, [blocksByTrack]);

  const totalTimelineWidth = labelWidth + Math.max(1, durationInFrames * frameWidth);

  /*
   * X-coordinate inside the timeline content.
   *
   * TimelineView adds labelWidth when rendering
   * the actual visual position.
   */
  const currentFrameX = frameToX(currentFrame);

  const getPointerFrame = useCallback(
    (event: React.PointerEvent, timelineElement: HTMLDivElement | null) => {
      if (!timelineElement) {
        return 0;
      }

      const rect = timelineElement.getBoundingClientRect();

      /*
       * Convert viewport X into timeline-content X.
       *
       * rect.left
       *   -> beginning of the scroll container
       *
       * - labelWidth
       *   -> skip the track-name column
       *
       * + scrollLeft
       *   -> compensate horizontal scrolling
       */
      const contentX = event.clientX - rect.left - labelWidth + timelineElement.scrollLeft;

      return clamp(xToFrame(contentX), 0, durationInFrames);
    },
    [durationInFrames, labelWidth, xToFrame],
  );

  const getSnapCandidates = useCallback(
    (block: ResolvedEditorBlock) => {
      const segment = segments.find((item) => item.id === block.segmentId);

      const segmentStart = segment?.startFrame ?? 0;
      const segmentEnd = segment
        ? segment.startFrame + segment.durationFrames
        : Math.min(durationInFrames, segmentStart + block.segmentDuration);

      const candidates = [segmentStart, segmentEnd];

      for (const other of blocks) {
        if (other.editorId === block.editorId) {
          continue;
        }

        if (other.segmentId !== block.segmentId) {
          continue;
        }

        candidates.push(other.absoluteStartFrame);

        candidates.push(other.absoluteStartFrame + other.duration);
      }

      return candidates;
    },
    [blocks, durationInFrames, segments],
  );

  return {
    frameWidth,
    frameToX,
    xToFrame,
    blocksByTrack,
    subTracksByTrack,
    totalTimelineWidth,
    currentFrameX,
    getPointerFrame,
    getSnapCandidates,
  };
}
