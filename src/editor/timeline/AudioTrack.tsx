import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { AudioTrackState } from './audioTrackTypes';
import type { LocalAudioTrack } from '../../application/project/projectService';
import { uiText } from '../../domain/i18n/uiText';

type EditorAudioTrack = LocalAudioTrack & { publicPath: string };

type Props = {
  timeline: TTSTimeline;
  durationInFrames: number;
  frameToX: (frame: number) => number;
  labelWidth: number;
  frameWidth: number;
  audioTracks: EditorAudioTrack[];
  onChange: (trackId: string, patch: Partial<AudioTrackState>) => void;
  onAdd: (file: File) => void;
  audioSelectedId?: string | null;
  onSelect: (trackId: string) => void;
  onContextMenu?: (trackId: string, event: React.MouseEvent<HTMLDivElement>) => void;
  onScrub?: (event: React.PointerEvent<HTMLDivElement>) => void;
  bladeActive?: boolean;
  onBladeCut?: (trackId: string, event: React.PointerEvent<HTMLDivElement>) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const AudioTrack: React.FC<Props> = ({
  timeline,
  durationInFrames,
  frameToX,
  labelWidth,
  frameWidth,
  audioTracks,
  onChange,
  onAdd,
  audioSelectedId,
  onSelect,
  onContextMenu,
  onScrub,
  bladeActive = false,
}) => {
  const { translations: t, language } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef<{
    trackId: string;
    mode: 'move' | 'left' | 'right';
    startX: number;
    state: AudioTrackState;
  } | null>(null);

  const begin = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      track: EditorAudioTrack,
      mode: 'move' | 'left' | 'right',
    ) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(track.id);
      dragRef.current = {
        trackId: track.id,
        mode,
        startX: event.clientX,
        state: { ...track.state },
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [onSelect],
  );

  const move = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const delta = Math.round((event.clientX - drag.startX) / Math.max(1, frameWidth));
      const s = drag.state;

      if (drag.mode === 'move') {
        const requestedStart = clamp(
          s.startFrame + delta,
          0,
          Math.max(0, durationInFrames - s.durationFrames),
        );

        // Keep the clip in its current logical lane. Clamp against every
        // neighbour crossed during this drag, not only neighbours that are
        // completely before/after the requested destination.
        const neighbours = audioTracks
          .filter((track) => track.id !== drag.trackId)
          .map((track) => ({
            start: track.state.startFrame,
            end: track.state.startFrame + track.state.durationFrames,
          }));

        const originalStart = s.startFrame;
        const originalEnd = originalStart + s.durationFrames;
        let constrainedStart = requestedStart;

        if (requestedStart < originalStart) {
          // Moving left: stop at the closest clip edge crossed by the left edge.
          const blockingEnd = neighbours
            .filter((item) => item.end <= originalStart && item.end > requestedStart)
            .reduce((max, item) => Math.max(max, item.end), 0);
          constrainedStart = Math.max(requestedStart, blockingEnd);
        } else if (requestedStart > originalStart) {
          // Moving right: stop before the closest clip crossed by the right edge.
          const blockingStart = neighbours
            .filter(
              (item) => item.start >= originalEnd && item.start < requestedStart + s.durationFrames,
            )
            .reduce((min, item) => Math.min(min, item.start), durationInFrames);
          constrainedStart = Math.min(requestedStart, blockingStart - s.durationFrames);
        }
        constrainedStart = clamp(
          constrainedStart,
          0,
          Math.max(0, durationInFrames - s.durationFrames),
        );

        onChange(drag.trackId, { startFrame: constrainedStart });
      } else if (drag.mode === 'left') {
        const nextStart = clamp(s.startFrame + delta, 0, s.startFrame + s.durationFrames - 1);
        const consumed = nextStart - s.startFrame;
        onChange(drag.trackId, {
          startFrame: nextStart,
          durationFrames: s.durationFrames - consumed,
          sourceStartFrame: s.sourceStartFrame + consumed,
        });
      } else {
        const nextEnd = clamp(
          s.startFrame + s.durationFrames + delta,
          s.startFrame + 1,
          durationInFrames,
        );
        const added = nextEnd - (s.startFrame + s.durationFrames);
        onChange(drag.trackId, {
          durationFrames: s.durationFrames + added,
          sourceEndFrame: s.sourceEndFrame + added,
        });
      }
    },
    [audioTracks, durationInFrames, frameWidth, onChange],
  );

  const end = useCallback(() => {
    dragRef.current = null;
  }, []);

  const audioLanes = useMemo(() => {
    const sorted = [...audioTracks].sort((a, b) => {
      if (a.state.startFrame !== b.state.startFrame) return a.state.startFrame - b.state.startFrame;
      return a.id.localeCompare(b.id);
    });
    const laneEnds: number[] = [];
    return sorted.map((track) => {
      const start = track.state.startFrame;
      const end = start + track.state.durationFrames;
      let lane = laneEnds.findIndex((laneEnd) => start >= laneEnd);
      if (lane < 0) {
        lane = laneEnds.length;
      }
      laneEnds[lane] = end;
      return { track, lane };
    });
  }, [audioTracks]);

  const audioFileName = useMemo(() => {
    if (audioTracks.length === 0) return t.audio.notLoaded;
    return `${audioTracks.length} ${uiText(language, audioTracks.length === 1 ? 'audioOne' : audioTracks.length < 5 ? 'audioFew' : 'audioMany')}`;
  }, [audioTracks.length, language, t.audio.notLoaded]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: '#0d1522',
      }}
      onPointerDown={(event) => event.stopPropagation()}
      data-audio-track
    >
      <div
        style={{
          minHeight: 38,
          display: 'flex',
          alignItems: 'stretch',
          color: '#94a3b8',
          fontSize: 10,
        }}
      >
        <div
          style={{
            width: labelWidth,
            flex: `0 0 ${labelWidth}px`,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? t.timeline.expand : t.timeline.collapse}
            style={{
              width: 24,
              height: 24,
              border: '1px solid rgba(148,163,184,0.22)',
              borderRadius: 5,
              background: '#172033',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontSize: 11,
              flex: '0 0 auto',
            }}
          >
            {collapsed ? '▸' : '▾'}
          </button>
          <span style={{ marginLeft: 7, color: '#94a3b8', fontSize: 10 }}>{t.audio.title}</span>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 8,
            padding: '4px 8px',
            boxSizing: 'border-box',
          }}
        >
          <label
            title={t.audio.addRecording}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 24,
              padding: '0 9px',
              border: '1px solid rgba(96,165,250,0.35)',
              borderRadius: 5,
              background: '#172033',
              color: '#bfdbfe',
              cursor: 'pointer',
              fontSize: 10,
              userSelect: 'none',
              boxSizing: 'border-box',
              flex: '0 0 auto',
            }}
          >
            {t.audio.upload}
            <input
              type="file"
              accept=".wav,.mp3,.m4a,.aac,.ogg,.webm,audio/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAdd(file);
                event.currentTarget.value = '';
              }}
            />
          </label>
          <span style={{ color: '#64748b', fontSize: 10 }}>{audioFileName}</span>
        </div>
      </div>

      {!collapsed && (
        <div
          style={{
            position: 'relative',
            height: Math.max(
              56,
              Math.max(
                1,
                audioLanes.reduce((max, item) => Math.max(max, item.lane + 1), 0),
              ) *
                46 +
                2,
            ),
            width: '100%',
          }}
        >
          <div
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              if ((event.target as HTMLElement).closest('[data-audio-clip]')) return;
              onScrub?.(event);
            }}
            style={{ position: 'absolute', left: labelWidth, right: 0, top: 0, bottom: 0 }}
          />
          {audioLanes.map(({ track, lane }) => {
            const left = frameToX(track.state.startFrame);
            const width = Math.max(
              8,
              frameToX(track.state.startFrame + track.state.durationFrames) - left,
            );
            const selected = audioSelectedId === track.id;
            const name =
              track.fileName ||
              track.publicPath.split('/').pop() ||
              timeline.voiceover?.file ||
              t.audio.title;
            return (
              <div
                key={track.id}
                data-audio-clip
                data-audio-track-id={track.id}
                onPointerDown={(event) => {
                  if (bladeActive) return;
                  if (event.button === 0) onSelect(track.id);
                  event.stopPropagation();
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelect(track.id);
                  onContextMenu?.(track.id, event);
                }}
                style={{
                  position: 'absolute',
                  left: labelWidth + left,
                  top: 8 + lane * 46,
                  width,
                  height: 40,
                  borderRadius: 6,
                  background: track.state.muted
                    ? 'rgba(100,116,139,0.25)'
                    : 'rgba(59,130,246,0.30)',
                  backgroundColor: track.state.muted
                    ? 'rgba(100,116,139,0.25)'
                    : 'rgba(59,130,246,0.30)',
                  border: selected
                    ? '2px solid rgba(147,197,253,0.95)'
                    : '1px solid rgba(96,165,250,0.85)',
                  boxSizing: 'border-box',
                  cursor: bladeActive ? 'none' : 'grab',
                  overflow: 'hidden',
                }}
                title={`${uiText(language, 'audioTrack')}: ${name}`}
              >
                <div
                  onPointerDown={(event) => begin(event, track, 'move')}
                  onPointerMove={move}
                  onPointerUp={end}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    color: '#bfdbfe',
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                    opacity: track.state.muted ? 0.55 : 1,
                  }}
                >
                  ♫ {name} · {Math.round(track.state.volume * 100)}%
                </div>
                <div
                  onPointerDown={(event) => begin(event, track, 'left')}
                  onPointerMove={move}
                  onPointerUp={end}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 7,
                    cursor: 'ew-resize',
                    background: selected ? 'rgba(191,219,254,0.9)' : 'rgba(147,197,253,0.45)',
                  }}
                />
                <div
                  onPointerDown={(event) => begin(event, track, 'right')}
                  onPointerMove={move}
                  onPointerUp={end}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 7,
                    cursor: 'ew-resize',
                    background: selected ? 'rgba(191,219,254,0.9)' : 'rgba(147,197,253,0.45)',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
