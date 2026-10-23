import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { uiText } from '../../domain/i18n/uiText';

type TimelineToolbarProps = {
  bladeActive: boolean;
  onBladeToggle: () => void;
};

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({ bladeActive, onBladeToggle }) => {
  const { language } = useI18n();
  return (
    <div
      data-timeline-toolbar
      style={{
        height: 42,
        width: '100%',
        minWidth: 0,
        flex: '0 0 42px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        boxSizing: 'border-box',
        border: '1px solid rgba(100,160,255,0.18)',
        borderRadius: 10,
        background: 'linear-gradient(180deg, #111b2c 0%, #0b1220 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
      }}
    >
      <button
        type="button"
        aria-pressed={bladeActive}
        title={bladeActive ? uiText(language, 'scissorsOff') : uiText(language, 'scissorsOn')}
        onClick={onBladeToggle}
        style={{
          width: 34,
          height: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: bladeActive
            ? '1px dashed rgba(248,113,113,0.95)'
            : '1px solid rgba(148,174,214,0.18)',
          borderRadius: 8,
          background: bladeActive
            ? 'rgba(127,29,29,0.45)'
            : 'linear-gradient(180deg, #1b2a40, #121d2e)',
          color: bladeActive ? '#fecaca' : '#cbd5e1',
          cursor: 'pointer',
          opacity: 1,
          fontSize: 16,
        }}
      >
        ✂
      </button>
    </div>
  );
};
