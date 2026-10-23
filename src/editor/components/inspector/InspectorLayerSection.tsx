import React from 'react';

import type { VisualBlockLayer } from '../../../domain/blocks/blockTypes';

import type { ResolvedEditorBlock } from '../../editorTypes';

import { useI18n } from '../../i18n/I18nContext';

import { NumberInput, SelectInput } from './InspectorInputs';

import { HotkeyButton } from '../HotkeyButton';

type InspectorLayerSectionProps = {
  block: ResolvedEditorBlock['block'];

  onZIndexChange: (zIndex: number) => void;

  onLayerChange: (layer: VisualBlockLayer) => void;

  onMoveForward: () => void;
  onMoveBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
};

export const InspectorLayerSection: React.FC<InspectorLayerSectionProps> = ({
  block,
  onZIndexChange,
  onLayerChange,
  onMoveForward,
  onMoveBackward,
  onBringToFront,
  onSendToBack,
}) => {
  const { translations: t } = useI18n();

  const layerOptions = [
    {
      value: 'background',
      label: t.layer.background,
    },
    {
      value: 'image',
      label: t.layer.images,
    },
    {
      value: 'character',
      label: t.layer.characters,
    },
    {
      value: 'text',
      label: t.layer.text,
    },
    {
      value: 'shape',
      label: t.layer.shapes,
    },
    {
      value: 'other',
      label: t.layer.other,
    },
  ];

  return (
    <>
      <SelectInput
        label={t.inspector.layer}
        value={block.layer ?? 'other'}
        options={layerOptions}
        onChange={(value) => onLayerChange(value as VisualBlockLayer)}
      />

      <NumberInput label={t.inspector.zIndex} value={block.zIndex ?? 0} onChange={onZIndexChange} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        <HotkeyButton hotkey="Ctrl+]" type="button" onClick={onMoveForward} style={buttonStyle}>
          {t.inspector.moveForward}
        </HotkeyButton>

        <HotkeyButton hotkey="Ctrl+[" type="button" onClick={onMoveBackward} style={buttonStyle}>
          {t.inspector.moveBackward}
        </HotkeyButton>

        <HotkeyButton
          hotkey="Ctrl+Shift+]"
          type="button"
          onClick={onBringToFront}
          style={buttonStyle}
        >
          {t.inspector.bringToFront}
        </HotkeyButton>

        <HotkeyButton
          hotkey="Ctrl+Shift+["
          type="button"
          onClick={onSendToBack}
          style={buttonStyle}
        >
          {t.inspector.sendToBack}
        </HotkeyButton>
      </div>
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  height: 30,
  padding: '0 8px',
  border: '1px solid #3a3a3a',
  borderRadius: 4,
  background: '#292929',
  color: '#ccc',
  cursor: 'pointer',
  fontSize: 11,
};
