import React from 'react';

import type { ResolvedEditorBlock } from '../editorTypes';

import type { TrackId } from './timelineTypes';

import { MIN_BLOCK_WIDTH, TRACK_HEIGHT } from './timelineConstants';

import { useI18n } from '../i18n/I18nContext';

type TimelineBlockProps = {
  block: ResolvedEditorBlock;

  selected: boolean;
  dragging: boolean;

  track: TrackId;
  subTrackIndex: number;

  frameToX: (frame: number) => number;

  fps: number;

  onPointerDown: (
    event: React.PointerEvent,
    block: ResolvedEditorBlock,
    type: 'move' | 'resize-left' | 'resize-right',
  ) => void;

  onPointerMove: (event: React.PointerEvent) => void;

  onPointerUp: (event: React.PointerEvent) => void;

  onSelect: (id: string | null) => void;
  bladeActive?: boolean;
};

const TimelineBlockComponent: React.FC<TimelineBlockProps> = ({
  block,
  selected,
  dragging,
  track,
  subTrackIndex,
  frameToX,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSelect,
  bladeActive = false,
}) => {
  const { translations: t } = useI18n();

  const blockTypeLabels: Record<string, string> = {
    text: t.library.text,
    number: t.library.number,
    money: t.library.money,
    metric: t.library.metric,
    stat: t.library.stat,
    chart: t.library.chart,
    barChart: t.library.barChart,
    comparison: t.library.comparison,
    group: t.library.group,
    stack: t.library.stack,
    sequence: t.library.sequence,
    rectangle: t.library.rectangle,
    circle: t.library.circle,
    line: t.library.line,
    arrow: t.library.arrow,
    bar: t.library.bar,
    progress: t.library.progress,
    badge: t.library.badge,
    image: t.library.image,
  };

  const left = frameToX(block.absoluteStartFrame);

  const width = Math.max(MIN_BLOCK_WIDTH, frameToX(block.duration));

  const blockHeight = TRACK_HEIGHT / 2;

  // Metallic timeline palette: restrained steel-like highlights, distinct per track.
  // These are timeline-only and do not affect the actual rendered block.
  const trackColors: Record<
    TrackId,
    { base: string; highlight: string; selected: string; tint: string }
  > = {
    background: {
      base: '#53677f',
      highlight: '#dce8f5',
      selected: '#53677f',
      tint: 'rgba(198,213,230,0.12)',
    },
    image: {
      base: '#2677a8',
      highlight: '#c4efff',
      selected: '#2677a8',
      tint: 'rgba(56,189,248,0.12)',
    },
    character: {
      base: '#21816d',
      highlight: '#baf5e5',
      selected: '#21816d',
      tint: 'rgba(52,211,153,0.12)',
    },
    text: {
      base: '#a87519',
      highlight: '#fff0bf',
      selected: '#a87519',
      tint: 'rgba(251,191,36,0.12)',
    },
    shape: {
      base: '#7651a1',
      highlight: '#edddff',
      selected: '#7651a1',
      tint: 'rgba(167,139,250,0.12)',
    },
    other: {
      base: '#596579',
      highlight: '#e5edf7',
      selected: '#596579',
      tint: 'rgba(203,213,225,0.12)',
    },
  };
  const trackColor = trackColors[track] ?? trackColors.other;

  const top = subTrackIndex * TRACK_HEIGHT + (TRACK_HEIGHT - blockHeight) / 2;

  return (
    <div
      data-editor-block="true"
      data-dragging={dragging ? 'true' : undefined}
      data-editor-id={block.editorId}
      onPointerDown={(event) => {
        if (bladeActive) {
          // Blade is intentionally supported for audio only. Visual clips are
          // non-actionable while Blade is active.
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onPointerDown(event, block, 'move');
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(event) => {
        event.stopPropagation();

        onSelect(block.editorId);
      }}
      style={{
        position: 'absolute',

        left,
        top,

        width,

        height: blockHeight,

        borderRadius: 6,

        border: selected ? `2px solid ${trackColor.highlight}` : '1px solid rgba(255,255,255,0.10)',

        // Render each clip with a single solid fill.
        background: `linear-gradient(180deg, color-mix(in srgb, ${trackColor.base} 76%, white) 0%, ${trackColor.base} 38%, color-mix(in srgb, ${trackColor.base} 72%, black) 100%)`,

        boxShadow: selected ? `0 0 0 1px rgba(255,255,255,0.08)` : 'none',

        boxSizing: 'border-box',

        zIndex: selected ? 20 : 10,

        // Show a plain red cross only over visual timeline blocks (no circle/reticle).
        // Audio clips keep their separate cursor behavior in AudioTrack.
        cursor: bladeActive
          ? 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%229%22 fill=%22none%22 stroke=%22%23ef4444%22 stroke-width=%222.5%22/%3E%3Cpath d=%22M5.6 5.6l12.8 12.8%22 stroke=%22%23ef4444%22 stroke-width=%222.5%22 stroke-linecap=%22round%22/%3E%3C/svg%3E") 12 12, not-allowed'
          : dragging
            ? 'grabbing'
            : 'grab',

        userSelect: 'none',

        touchAction: 'none',

        opacity: dragging ? 0.88 : 1,

        overflow: 'hidden',

        display: 'flex',

        alignItems: 'center',

        padding: '0 12px',

        fontSize: 11,

        fontWeight: selected ? 750 : 600,

        letterSpacing: '0.02em',

        color: '#f8fafc',

        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: 'none',
        }}
      >
        {blockTypeLabels[block.block.type] ?? block.block.type}
      </div>

      <div
        data-resize-handle="true"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();

          onPointerDown(event, block, 'resize-left');
        }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'ew-resize',
          zIndex: 30,
          touchAction: 'none',
          background: selected ? trackColor.highlight : 'rgba(255,255,255,0.18)',
          borderRadius: 3,
          boxShadow: 'none',
        }}
      />

      <div
        data-resize-handle="true"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();

          onPointerDown(event, block, 'resize-right');
        }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'ew-resize',
          zIndex: 30,
          touchAction: 'none',
          background: selected ? trackColor.highlight : 'rgba(255,255,255,0.18)',
          borderRadius: 3,
          boxShadow: 'none',
        }}
      />

      {track === 'other' && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            bottom: 2,
            fontSize: 9,
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          {block.block.layer ?? t.layer.other}
        </div>
      )}
    </div>
  );
};

export const TimelineBlock = React.memo(TimelineBlockComponent);

TimelineBlock.displayName = 'TimelineBlock';
