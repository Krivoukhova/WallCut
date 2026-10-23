import React, { useState } from 'react';
import type { VisualBlockData } from '../../../domain/blocks/blockTypes';
import { useI18n } from '../../i18n/I18nContext';
import { uiText } from '../../../domain/i18n/uiText';

export const StackAddControl: React.FC<{
  onAddChild?: (type: VisualBlockData['type']) => void;
}> = ({ onAddChild }) => {
  const { translations: t, language } = useI18n();
  const [open, setOpen] = useState(false);

  const options = [
    ['text', uiText(language, 'row')],
    ['number', uiText(language, 'number')],
    ['money', uiText(language, 'money')],
    ['image', uiText(language, 'picture')],
  ] as const;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t.sceneInspector.addContent}
        style={{
          width: '100%',
          minHeight: 34,
          border: '1px dashed #555',
          borderRadius: 6,
          background: '#252525',
          color: '#bbb',
          cursor: 'pointer',
          fontSize: 18,
        }}
      >
        +
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 4,
      }}
    >
      {options.map(([type, label]) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            onAddChild?.(type);
            setOpen(false);
          }}
          style={{
            minWidth: 0,
            padding: '7px 6px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#252525',
            color: '#bbb',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          + {label}
        </button>
      ))}
    </div>
  );
};
