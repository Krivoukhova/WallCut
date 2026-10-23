import React from 'react';

import type { AudioTrackState } from '../timeline/audioTrackTypes';
import type { EditorAudioTrack } from '../timeline/audioTrackOperations';
import type { useI18n } from '../i18n/I18nContext';

type Translations = ReturnType<typeof useI18n>['translations'];
type ContextMenuState = {
  x: number;
  y: number;
  type: 'editor' | 'audio';
  trackId?: string;
} | null;
type ContextAction = [label: string, action: () => void, disabled: boolean];

type EditorContextMenuProps = {
  contextMenu: ContextMenuState;
  audioTracks: EditorAudioTrack[];
  translations: Translations;
  onUpdateAudioTrack: (trackId: string, patch: Partial<AudioTrackState>) => void;
  onDeleteAudioTrack: (trackId: string) => void;
  onRunAction: (action: () => void) => void;
  actions: ContextAction[];
};

export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  contextMenu,
  audioTracks,
  translations: t,
  onUpdateAudioTrack,
  onDeleteAudioTrack,
  onRunAction,
  actions,
}) => {
  if (!contextMenu) return null;

  const selectedAudio = contextMenu.trackId
    ? audioTracks.find((track) => track.id === contextMenu.trackId)
    : undefined;

  const menuButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    textAlign: 'left',
    border: 0,
    borderRadius: 5,
    background: 'transparent',
  };

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        position: 'fixed',
        left: contextMenu.x,
        top: contextMenu.y,
        width: 220,
        padding: 6,
        borderRadius: 8,
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
        zIndex: 10000,
        color: '#e5e7eb',
        fontSize: 12,
      }}
    >
      {contextMenu.type === 'audio' ? (
        <>
          <div
            style={{
              padding: '6px 10px 4px',
              color: '#94a3b8',
              fontSize: 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {selectedAudio?.fileName ?? t.audio.title}
          </div>
          <div style={{ padding: '6px 10px 8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 5,
                color: '#94a3b8',
                fontSize: 11,
              }}
            >
              <span>{t.audio.volume}</span>
              <span>{selectedAudio ? Math.round(selectedAudio.state.volume * 100) : 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedAudio?.state.volume ?? 0}
              disabled={!selectedAudio}
              onChange={(event) => {
                if (contextMenu.trackId) {
                  onUpdateAudioTrack(contextMenu.trackId, { volume: Number(event.target.value) });
                }
              }}
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                height: 18,
                writingMode: 'horizontal-tb',
                direction: 'ltr',
                appearance: 'auto',
                transform: 'none',
                flex: '0 0 auto',
              }}
            />
          </div>
          <button
            type="button"
            disabled={!selectedAudio}
            onClick={() => {
              if (contextMenu.trackId) {
                onUpdateAudioTrack(contextMenu.trackId, { muted: !selectedAudio?.state.muted });
              }
            }}
            style={{
              ...menuButtonStyle,
              color: '#e5e7eb',
              cursor: selectedAudio ? 'pointer' : 'default',
            }}
          >
            {selectedAudio?.state.muted
              ? `🔊 ${t.audio.enableSound}`
              : `🔇 ${t.audio.disableSound}`}
          </button>
          <button
            type="button"
            onClick={() => contextMenu.trackId && onDeleteAudioTrack(contextMenu.trackId)}
            style={{ ...menuButtonStyle, color: '#fca5a5', cursor: 'pointer' }}
          >
            {t.contextMenu.delete}
          </button>
        </>
      ) : (
        actions.map(([label, action, disabled]) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onRunAction(action)}
            style={{
              ...menuButtonStyle,
              color: disabled
                ? '#475569'
                : label === t.contextMenu.delete
                  ? '#f87171'
                  : '#e5e7eb',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {label}
          </button>
        ))
      )}
    </div>
  );
};
