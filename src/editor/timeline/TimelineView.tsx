import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { ResolvedEditorBlock } from '../editorTypes';

import type { TrackId, TimelineSubTrack } from './timelineTypes';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { AudioTrackState } from './audioTrackTypes';
import type { LocalAudioTrack } from '../../application/project/projectService';
import { AudioTrack } from './AudioTrack';

import {
  HEADER_HEIGHT,
  TRACK_IDS,
  MIN_TIMELINE_HEIGHT,
  MAX_TIMELINE_HEIGHT,
  RULER_HEIGHT,
} from './timelineConstants';

import { formatTime } from './timelineUtils';

import { TimelineResizeHandle } from './TimelineResizeHandle';

import { TimelineTrack } from './TimelineTrack';

import { useI18n } from '../i18n/I18nContext';

const MIN_LABEL_WIDTH = 100;
const MAX_LABEL_WIDTH = 350;

const LABEL_RESIZE_HANDLE_WIDTH = 12;

export type TimelineViewProps = {
  timelineHeight: number;

  timelineRef: React.RefObject<HTMLDivElement | null>;

  totalTimelineWidth: number;

  durationInFrames: number;

  fps: number;

  timeline: TTSTimeline;

  frameWidth: number;

  frameToX: (frame: number) => number;

  currentFrameX: number;

  labelWidth: number;

  onLabelWidthChange: (width: number) => void;

  segmentBoundaries: number[];

  blocksByTrack: Record<TrackId, ResolvedEditorBlock[]>;

  subTracksByTrack: Record<TrackId, TimelineSubTrack[]>;

  collapsed: Record<TrackId, boolean>;

  draggingId: string | null;

  dropTrackId: TrackId | null;

  selectedBlockId: string | null;

  onSelect: (id: string | null) => void;

  bladeActive?: boolean;
  onBladeAudioCut?: (trackId: string, event: React.PointerEvent<HTMLDivElement>) => void;

  onCurrentFramePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;

  onTimelinePointerDown: React.PointerEventHandler<HTMLDivElement>;

  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;

  onResizeMove: (event: React.PointerEvent<HTMLDivElement>) => void;

  onResizeEnd: (event: React.PointerEvent<HTMLDivElement>) => void;

  onToggleTrack: (id: TrackId) => void;

  onBlockPointerDown: TimelineTrackProps['onBlockPointerDown'];

  onBlockPointerMove: TimelineTrackProps['onBlockPointerMove'];

  onBlockPointerUp: TimelineTrackProps['onBlockPointerUp'];

  audioTracks: Array<LocalAudioTrack & { publicPath: string }>;
  onAudioStateChange: (trackId: string, patch: Partial<AudioTrackState>) => void;
  onAudioAdd: (file: File) => void;
  audioSelectedId?: string | null;
  onAudioSelect?: (trackId: string) => void;
  onAudioContextMenu?: (trackId: string, event: React.MouseEvent<HTMLDivElement>) => void;
  onAudioScrub?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

type TimelineTrackProps = React.ComponentProps<typeof TimelineTrack>;

export const TimelineView: React.FC<TimelineViewProps> = ({
  timelineHeight,
  timelineRef,
  totalTimelineWidth,
  durationInFrames,
  fps,
  timeline,
  frameWidth,
  frameToX,
  currentFrameX,
  labelWidth,
  onLabelWidthChange,
  segmentBoundaries,
  blocksByTrack,
  subTracksByTrack,
  collapsed,
  draggingId,
  dropTrackId,
  selectedBlockId,
  onSelect,
  bladeActive = false,
  onBladeAudioCut,
  onCurrentFramePointerDown,
  onTimelinePointerDown,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onToggleTrack,
  onBlockPointerDown,
  onBlockPointerMove,
  onBlockPointerUp,
  audioTracks,
  onAudioStateChange,
  onAudioAdd,
  onAudioContextMenu,
  audioSelectedId,
  onAudioSelect,
  onAudioScrub,
}) => {
  const { translations: t } = useI18n();

  const labelResizeRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const [labelResizeActive, setLabelResizeActive] = useState(false);

  const [bladeGuideX, setBladeGuideX] = useState<number | null>(null);
  const [bladeGuideY, setBladeGuideY] = useState<number | null>(null);

  const handleLabelResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      labelResizeRef.current = {
        pointerId: event.pointerId,

        startX: event.clientX,

        startWidth: labelWidth,
      };

      setLabelResizeActive(true);

      document.body.style.cursor = 'col-resize';

      document.body.style.userSelect = 'none';

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Ignore.
      }
    },
    [labelWidth],
  );

  const handleLabelResizeMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const resize = labelResizeRef.current;

      if (!resize) {
        return;
      }

      if (event.pointerId !== resize.pointerId) {
        return;
      }

      const delta = event.clientX - resize.startX;

      const nextWidth = Math.max(
        MIN_LABEL_WIDTH,
        Math.min(MAX_LABEL_WIDTH, resize.startWidth + delta),
      );

      onLabelWidthChange(nextWidth);
    },
    [onLabelWidthChange],
  );

  const handleLabelResizeEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const resize = labelResizeRef.current;

    if (!resize) {
      return;
    }

    if (event.pointerId !== resize.pointerId) {
      return;
    }

    labelResizeRef.current = null;

    setLabelResizeActive(false);

    document.body.style.cursor = '';

    document.body.style.userSelect = '';

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore.
    }
  }, []);

  useEffect(() => {
    return () => {
      labelResizeRef.current = null;

      document.body.style.cursor = '';

      document.body.style.userSelect = '';
    };
  }, []);

  const contentWidth = durationInFrames * frameWidth;

  const timelineContentWidth = labelWidth + contentWidth;

  const effectiveTimelineWidth = Math.max(totalTimelineWidth, timelineContentWidth);

  const handleBladePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!bladeActive) {
        setBladeGuideX(null);
        setBladeGuideY(null);
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left + event.currentTarget.scrollLeft;
      const y = event.clientY - rect.top + event.currentTarget.scrollTop;
      const contentX = x - labelWidth;
      if (contentX < 0 || contentX > contentWidth) {
        setBladeGuideX(null);
        setBladeGuideY(null);
        return;
      }
      setBladeGuideX(contentX);
      setBladeGuideY(y - HEADER_HEIGHT - RULER_HEIGHT);
    },
    [bladeActive, contentWidth, labelWidth],
  );

  const handleBladePointerLeave = useCallback(() => {
    setBladeGuideX(null);
    setBladeGuideY(null);
  }, []);

  const handleBladePointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!bladeActive || event.button !== 0) return;

      const target = event.target instanceof Element ? event.target : null;
      const audioElement = target?.closest('[data-audio-clip="true"]') as HTMLElement | null;

      // Blade mode is audio-only. Never infer a visual block from the pointer
      // position: overlays, gaps, and nested elements can make that inference
      // ambiguous and previously allowed visual layers to be split.
      event.preventDefault();
      event.stopPropagation();

      if (!audioElement) return;

      const trackId = audioElement.dataset.audioTrackId;
      if (trackId && onBladeAudioCut) {
        onBladeAudioCut(trackId, event);
      }
    },
    [bladeActive, onBladeAudioCut],
  );

  return (
    <div
      style={{
        width: '100%',
        height: timelineHeight,

        minHeight: MIN_TIMELINE_HEIGHT,

        maxHeight: MAX_TIMELINE_HEIGHT,

        border: '1px solid rgba(100,160,255,0.20)',

        borderRadius: 12,

        background: 'linear-gradient(180deg, #0d1422 0%, #090e18 100%)',

        boxShadow: '0 10px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.035)',

        overflow: 'hidden',

        position: 'relative',

        boxSizing: 'border-box',

        flex: '0 0 auto',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <TimelineResizeHandle
        onResizeStart={onResizeStart}
        onResizeMove={onResizeMove}
        onResizeEnd={onResizeEnd}
      />

      <div
        ref={timelineRef}
        onPointerDown={onTimelinePointerDown}
        onPointerDownCapture={handleBladePointerDownCapture}
        onPointerMove={handleBladePointerMove}
        onPointerLeave={handleBladePointerLeave}
        style={{
          position: 'relative',

          // Keep the scroll viewport constrained to the available screen width.
          // Timeline rows/header below can still be wider and scroll horizontally.
          width: '100%',

          minWidth: 0,

          height: '100%',

          overflow: 'auto',

          boxSizing: 'border-box',

          userSelect: 'none',

          cursor: bladeActive ? 'none' : 'default',

          background: '#0a101c',
          scrollbarColor: '#34445e #0b1220',
          scrollbarWidth: 'thin',
        }}
      >

        <div
          style={{
            position: 'sticky',

            top: 0,
            left: 0,

            width: effectiveTimelineWidth,

            height: HEADER_HEIGHT,

            background: 'linear-gradient(180deg, #172338 0%, #111a2a 100%)',

            borderBottom: '1px solid rgba(111,160,255,0.20)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.14)',

            zIndex: 100,
          }}
        >
          <div
            style={{
              position: 'absolute',

              left: 0,
              top: 0,

              width: labelWidth,

              height: HEADER_HEIGHT,

              background: 'linear-gradient(135deg, #1a2b45 0%, #121d30 100%)',

              borderRight: '1px solid rgba(111,160,255,0.18)',
              boxShadow: 'inset 3px 0 0 rgba(59,130,246,0.8)',

              display: 'flex',

              alignItems: 'center',

              padding: '0 12px',

              boxSizing: 'border-box',

              color: '#dbeafe',

              fontSize: 11,

              fontWeight: 750,
              letterSpacing: '0.075em',
              textTransform: 'uppercase',

              zIndex: 110,
            }}
          >
            {t.editor.timeline}
          </div>
        </div>

        <div
          style={{
            position: 'relative',

            marginLeft: labelWidth,

            width: contentWidth,

            height: RULER_HEIGHT,

            borderBottom: '1px solid rgba(148,163,184,0.13)',

            background: 'linear-gradient(180deg, #111b2d 0%, #0d1523 100%)',
          }}
        >
          {Array.from(
            {
              length: Math.ceil(durationInFrames / fps) + 1,
            },
            (_, index) => {
              const frame = index * fps;

              if (frame > durationInFrames) {
                return null;
              }

              const left = frameToX(frame);

              return (
                <div
                  key={frame}
                  style={{
                    position: 'absolute',

                    left,

                    top: 0,

                    height: RULER_HEIGHT,

                    borderLeft: '1px solid rgba(255,255,255,0.12)',

                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',

                      left: 4,
                      top: 5,

                      fontSize: 10,

                      color: '#8fa4c2',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 550,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',

                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTime(frame, fps)}
                  </span>
                </div>
              );
            },
          )}
        </div>

        <div
          style={{
            position: 'relative',

            width: effectiveTimelineWidth,

            minHeight: 100,

            background: 'linear-gradient(180deg, #0b1220 0%, #090f1b 100%)',
          }}
        >

          <div
            style={{
              position: 'absolute',

              left: labelWidth,

              top: 0,
              bottom: 0,

              width: contentWidth,

              pointerEvents: 'none',

              backgroundImage: `repeating-linear-gradient(
                    to right,
                    rgba(123,158,207,0.075) 0px,
                    rgba(123,158,207,0.075) 1px,
                    transparent 1px,
                    transparent ${Math.max(1, frameWidth * fps)}px
                  )`,
            }}
          />

          {bladeActive && bladeGuideX !== null && bladeGuideY !== null && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: labelWidth + bladeGuideX,
                top: Math.max(0, bladeGuideY - 18),
                height: 36,
                width: 0,
                borderLeft: '1px dashed rgba(248,250,252,0.9)',
                pointerEvents: 'none',
                zIndex: 1500,
              }}
            />
          )}

          {segmentBoundaries.map((frame) => (
            <div
              key={`segment-${frame}`}
              style={{
                position: 'absolute',

                left: labelWidth + frameToX(frame),

                top: 0,
                bottom: 0,

                width: 1,

                background: 'rgba(251,191,36,0.22)',

                pointerEvents: 'none',

                zIndex: 2,
              }}
            />
          ))}

          <div
            data-current-frame
            onPointerDown={onCurrentFramePointerDown}
            style={{
              position: 'absolute',

              left: labelWidth + currentFrameX,

              top: 0,
              bottom: 0,

              width: 1,

              background: '#fb536b',
              boxShadow: '0 0 8px rgba(251,83,107,0.58), 0 0 1px rgba(255,255,255,0.8)',

              pointerEvents: bladeActive ? 'none' : 'auto',

              zIndex: 2000,

              cursor: 'ew-resize',

              touchAction: 'none',
            }}
          >

            <div
              style={{
                position: 'absolute',

                top: 0,
                left: -7,

                width: 15,
                height: 15,

                background: '#fb536b',
                boxShadow: '0 0 10px rgba(251,83,107,0.42)',

                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',

                cursor: 'ew-resize',

                pointerEvents: 'auto',

                touchAction: 'none',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -6,
                width: 13,
                cursor: 'ew-resize',
                pointerEvents: 'auto',
                touchAction: 'none',
              }}
            />
          </div>

          <AudioTrack
            timeline={timeline}
            durationInFrames={durationInFrames}
            frameToX={frameToX}
            labelWidth={labelWidth}
            frameWidth={frameWidth}
            audioTracks={audioTracks}
            bladeActive={bladeActive}
            onBladeCut={onBladeAudioCut}
            onChange={onAudioStateChange}
            onAdd={onAudioAdd}
            audioSelectedId={audioSelectedId}
            onSelect={(trackId) => onAudioSelect?.(trackId)}
            onContextMenu={(trackId, event) => onAudioContextMenu?.(trackId, event)}
            onScrub={onAudioScrub}
          />

          {TRACK_IDS.map((trackId) => (
            <TimelineTrack
              key={trackId}
              trackId={trackId}
              trackBlocks={blocksByTrack[trackId]}
              subTracks={subTracksByTrack[trackId]}
              totalTimelineWidth={effectiveTimelineWidth}
              labelWidth={labelWidth}
              collapsed={collapsed[trackId] ?? false}
              dropTarget={dropTrackId === trackId && draggingId !== null}
              draggingId={draggingId}
              selectedBlockId={selectedBlockId}
              fps={fps}
              frameToX={frameToX}
              onToggle={onToggleTrack}
              onBlockPointerDown={onBlockPointerDown}
              onBlockPointerMove={onBlockPointerMove}
              onBlockPointerUp={onBlockPointerUp}
              onSelect={onSelect}
              bladeActive={bladeActive}
            />
          ))}
        </div>
      </div>

      <div
        data-timeline-label-resize
        onPointerDown={handleLabelResizeStart}
        onPointerMove={handleLabelResizeMove}
        onPointerUp={handleLabelResizeEnd}
        onPointerCancel={handleLabelResizeEnd}
        style={{
          position: 'absolute',

          left: labelWidth - LABEL_RESIZE_HANDLE_WIDTH / 2,

          top: 0,

          width: LABEL_RESIZE_HANDLE_WIDTH,

          height: '100%',

          cursor: 'col-resize',

          zIndex: 1000,

          touchAction: 'none',

          userSelect: 'none',

          background: labelResizeActive ? 'rgba(59,130,246,0.16)' : 'transparent',

          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',

            left: LABEL_RESIZE_HANDLE_WIDTH / 2 - 1,

            top: 0,
            bottom: 0,

            width: 2,

            background: labelResizeActive ? '#3b82f6' : 'rgba(255,255,255,0.12)',

            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
