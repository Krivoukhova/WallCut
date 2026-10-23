import React from 'react';

import type { ResolvedEditorBlock } from '../editorTypes';

import type { TrackId, TimelineSubTrack } from './timelineTypes';

import { COLLAPSED_HEADER_HEIGHT, TRACK_HEIGHT, TRACK_ICONS } from './timelineConstants';

import { useI18n } from '../i18n/I18nContext';

import { TimelineBlock } from './TimelineBlock';

export type TimelineTrackProps = {
  trackId: TrackId;

  trackBlocks: ResolvedEditorBlock[];

  subTracks: TimelineSubTrack[];

  totalTimelineWidth: number;

  labelWidth: number;

  collapsed: boolean;

  dropTarget: boolean;

  draggingId: string | null;

  selectedBlockId: string | null;

  fps: number;

  frameToX: (frame: number) => number;

  onToggle: (trackId: TrackId) => void;

  onBlockPointerDown: (
    event: React.PointerEvent,
    block: ResolvedEditorBlock,
    type: 'move' | 'resize-left' | 'resize-right',
  ) => void;

  onBlockPointerMove: (event: React.PointerEvent) => void;

  onBlockPointerUp: (event: React.PointerEvent) => void;

  onSelect: (id: string | null) => void;

  bladeActive?: boolean;
};

const TimelineTrackComponent: React.FC<TimelineTrackProps> = ({
  trackId,
  trackBlocks,
  subTracks,
  totalTimelineWidth,
  labelWidth,
  collapsed,
  dropTarget,
  draggingId,
  selectedBlockId,
  fps,
  frameToX,
  onToggle,
  onBlockPointerDown,
  onBlockPointerMove,
  onBlockPointerUp,
  onSelect,
  bladeActive = false,
}) => {
  const { translations: t } = useI18n();

  const trackLabels: Record<TrackId, string> = {
    background: t.layer.background,

    image: t.layer.images,

    character: t.layer.characters,

    text: t.layer.text,

    shape: t.layer.shapes,

    other: t.layer.other,
  };

  // Consistent accent colors make neighboring layer groups easier to distinguish.
  const trackAccent: Record<TrackId, string> = {
    background: '#64748b',
    image: '#38bdf8',
    character: '#a78bfa',
    text: '#fbbf24',
    shape: '#34d399',
    other: '#fb7185',
  };

  const rowCount = collapsed ? 0 : Math.max(1, subTracks.length);

  const contentHeight = rowCount * TRACK_HEIGHT;

  const totalHeight = collapsed ? COLLAPSED_HEADER_HEIGHT : contentHeight;

  return (
    <div
      data-editor-track={trackId}
      style={{
        position: 'relative',

        width: totalTimelineWidth,

        height: totalHeight,

        minHeight: totalHeight,

        maxHeight: totalHeight,

        boxSizing: 'border-box',

        overflow: 'visible',

        flex: '0 0 auto',

        borderBottom: '1px solid rgba(111,145,190,0.16)',
        background: 'rgba(8,14,25,0.35)',
      }}
    >

      <div
        style={{
          position: 'absolute',

          left: 0,
          top: 0,

          width: labelWidth,

          height: collapsed ? COLLAPSED_HEADER_HEIGHT : contentHeight,

          borderRight: '1px solid rgba(148,163,184,0.14)',

          borderBottom: `1px solid ${trackAccent[trackId]}38`,

          borderLeft: `3px solid ${trackAccent[trackId]}d9`,

          background: `linear-gradient(110deg, ${trackAccent[trackId]}15 0%, rgba(18,28,44,0.98) 64%, rgba(13,21,34,0.98) 100%)`,

          boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.025)',

          display: 'flex',

          alignItems: 'center',

          boxSizing: 'border-box',

          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={() => onToggle(trackId)}
          style={{
            width: '100%',
            height: '100%',

            border: 0,

            background: 'transparent',

            color: '#e5e7eb',

            cursor: 'pointer',

            display: 'flex',

            alignItems: 'center',

            gap: 9,

            padding: '0 11px',

            textAlign: 'left',

            boxSizing: 'border-box',

            borderRadius: 0,
          }}
        >
          <span
            style={{
              width: 12,
              flex: '0 0 12px',

              opacity: 0.55,
              color: '#cbd5e1',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            {collapsed ? '›' : '⌄'}
          </span>

          <span
            style={{
              width: 25,

              height: 25,

              flex: '0 0 25px',

              opacity: 1,

              fontSize: 13,

              textAlign: 'center',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              color: trackAccent[trackId],
              background: `linear-gradient(145deg, ${trackAccent[trackId]}24, ${trackAccent[trackId]}0b)`,
              border: `1px solid ${trackAccent[trackId]}38`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
              boxSizing: 'border-box',
            }}
          >
            {TRACK_ICONS[trackId]}
          </span>

          <span
            style={{
              fontSize: 11,

              fontWeight: 650,

              letterSpacing: '0.015em',

              color: '#e2e8f0',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {trackLabels[trackId]}
          </span>

          <span
            style={{
              marginLeft: 'auto',

              fontSize: 10,

              fontWeight: 600,

              color: '#cbd5e1',

              opacity: 0.8,

              minWidth: 20,
              height: 20,
              padding: '0 5px',
              borderRadius: 7,
              background: 'rgba(148,163,184,0.10)',
              border: '1px solid rgba(148,163,184,0.14)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',

              flex: '0 0 auto',
            }}
          >
            {trackBlocks.length}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div
          style={{
            position: 'absolute',

            left: labelWidth,

            top: 0,

            width: totalTimelineWidth - labelWidth,

            height: contentHeight,

            background: dropTarget
              ? 'linear-gradient(90deg, rgba(59,130,246,0.13), rgba(59,130,246,0.035))'
              : `linear-gradient(90deg, ${trackAccent[trackId]}0c 0%, rgba(12,20,33,0.22) 100%)`,

            borderBottom: `1px solid ${trackAccent[trackId]}30`,

            boxSizing: 'border-box',

            overflow: 'visible',
          }}
        >

          {subTracks.map((subTrack, index) => {
            const rowTop = index * TRACK_HEIGHT;

            return (
              <div
                key={`subtrack-${trackId}-${index}`}
                style={{
                  position: 'absolute',

                  left: 0,

                  top: rowTop,

                  width: '100%',

                  height: TRACK_HEIGHT,

                  minHeight: TRACK_HEIGHT,

                  maxHeight: TRACK_HEIGHT,

                  boxSizing: 'border-box',

                  borderTop:
                    index > 0
                      ? '1px solid rgba(203,213,225,0.095)'
                      : `1px solid ${trackAccent[trackId]}24`,

                  background: index % 2 === 0 ? 'rgba(148,173,209,0.028)' : 'rgba(4,10,19,0.16)',
                }}
              >
                {subTrack.blocks.map((block) => (
                  <TimelineBlock
                    key={block.editorId}
                    block={block}
                    selected={selectedBlockId === block.editorId}
                    dragging={draggingId === block.editorId}
                    track={trackId}
                    subTrackIndex={0}
                    frameToX={frameToX}
                    fps={fps}
                    onPointerDown={onBlockPointerDown}
                    onPointerMove={onBlockPointerMove}
                    onPointerUp={onBlockPointerUp}
                    onSelect={onSelect}
                    bladeActive={bladeActive}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {dropTarget && !collapsed && (
        <div
          style={{
            position: 'absolute',

            left: labelWidth,

            top: 0,

            width: totalTimelineWidth - labelWidth,

            height: contentHeight,

            border: '1px dashed rgba(59,130,246,0.55)',

            boxSizing: 'border-box',

            pointerEvents: 'none',

            zIndex: 45,
          }}
        />
      )}
    </div>
  );
};

export const TimelineTrack = React.memo(TimelineTrackComponent);

TimelineTrack.displayName = 'TimelineTrack';
