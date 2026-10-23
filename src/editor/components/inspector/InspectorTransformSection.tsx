import React from 'react';

import type { ResolvedEditorBlock } from '../../editorTypes';

import { NumberInput } from './InspectorInputs';

import { useI18n } from '../../i18n/I18nContext';
import { uiText } from '../../../domain/i18n/uiText';

type InspectorTransformSectionProps = {
  block: ResolvedEditorBlock['block'];

  onXChange: (value: number) => void;
  onAlignSelected: (mode: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;
  onYChange: (value: number) => void;

  onScaleChange: (value: number) => void;
  onScaleXChange: (value: number) => void;
  onScaleYChange: (value: number) => void;

  onRotationChange: (value: number) => void;
  onOpacityChange: (value: number) => void;
};

export const InspectorTransformSection: React.FC<InspectorTransformSectionProps> = ({
  block,
  onXChange,
  onAlignSelected,
  onYChange,
  onScaleChange,
  onScaleXChange,
  onScaleYChange,
  onRotationChange,
  onOpacityChange,
}) => {
  const { translations: t, language } = useI18n();
  const text = (key: Parameters<typeof uiText>[1]) => uiText(language, key);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <NumberInput label="X" value={block.x ?? 540} onChange={onXChange} />

        <NumberInput label="Y" value={block.y ?? 960} onChange={onYChange} />
      </div>

      <NumberInput
        label={t.inspector.scale}
        value={block.scale ?? 1}
        onChange={onScaleChange}
        step={0.01}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <NumberInput
          label={t.inspector.scaleX}
          value={block.scaleX ?? 1}
          onChange={onScaleXChange}
          step={0.01}
        />

        <NumberInput
          label={t.inspector.scaleY}
          value={block.scaleY ?? 1}
          onChange={onScaleYChange}
          step={0.01}
        />
      </div>

      <NumberInput
        label={t.inspector.rotation}
        value={block.rotation ?? 0}
        onChange={onRotationChange}
      />

      <NumberInput
        label={t.inspector.opacity}
        value={block.opacity ?? 1}
        onChange={onOpacityChange}
        step={0.01}
        min={0}
        max={1}
      />

      <div
        style={{
          marginTop: 4,
          paddingTop: 10,
          borderTop: '1px solid #333',
        }}
      >
        <div
          style={{
            marginBottom: 7,
            fontSize: 11,
            color: '#aaa',
            fontWeight: 600,
          }}
        >
          {text('align')}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 5,
          }}
        >
          {[
            ['left', '←', text('alignLeft')],
            ['centerX', '↔', text('centerX')],
            ['right', '→', text('alignRight')],
            ['top', '↑', text('alignTop')],
            ['centerY', '↕', text('centerY')],
            ['bottom', '↓', text('alignBottom')],
          ].map(([mode, label, title]) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                onAlignSelected(mode as 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom')
              }
              title={title}
              style={{
                height: 30,
                border: '1px solid #444',
                borderRadius: 5,
                background: '#252525',
                color: '#ddd',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
