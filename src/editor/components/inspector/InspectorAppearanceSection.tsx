import React, { useEffect, useState } from 'react';

import { NumberInput, SelectInput } from './InspectorInputs';

import { useI18n } from '../../i18n/I18nContext';
import { uiText } from '../../../domain/i18n/uiText';

export type InspectorAppearanceSectionProps = {
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: number;
  fontFamily?: string;

  onFontSizeChange: (value: number) => void;

  onFontWeightChange: (value: number) => void;

  onFontFamilyChange?: (value: string) => void;

  onColorPreview: (color: string) => void;

  onColorChange: (color: string) => void;

  onColorStart: () => void;

  onBackgroundColorPreview: (color: string) => void;

  onBackgroundColorChange: (color: string) => void;

  onBackgroundColorStart: () => void;

  onFocus: () => void;
  onBlur: () => void;
};

type ColorControlProps = {
  label: string;
  color: string;

  onPreview: (color: string) => void;

  onChange: (color: string) => void;

  onStart: () => void;

  onFocus: () => void;
  onBlur: () => void;
  showOpacity?: boolean;
};

function parseColor(value: string): { hex: string; opacity: number } {
  const input = value.trim();
  const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((part) => part + part)
        .join('');
    return { hex: `#${hex}`, opacity: 1 };
  }
  const rgbMatch = input.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i,
  );
  if (rgbMatch) {
    const hex = `#${[rgbMatch[1], rgbMatch[2], rgbMatch[3]]
      .map((part) =>
        Math.max(0, Math.min(255, Number(part)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
    return {
      hex,
      opacity: rgbMatch[4] === undefined ? 1 : Math.max(0, Math.min(1, Number(rgbMatch[4]))),
    };
  }
  return { hex: '#1b1b1b', opacity: 1 };
}

function colorWithOpacity(value: string, opacity: number): string {
  const { hex } = parseColor(value);
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16));
  if (opacity >= 0.999) return hex;
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${Math.max(0, Math.min(1, opacity)).toFixed(2)})`;
}

const ColorControl: React.FC<ColorControlProps> = ({
  label,
  color,
  onPreview,
  onChange,
  onStart,
  onFocus,
  onBlur,
  showOpacity = false,
}) => {
  const { language } = useI18n();
  const [pickerColor, setPickerColor] = useState(parseColor(color).hex);
  const parsedColor = parseColor(color);

  useEffect(() => {
    setPickerColor(parseColor(color).hex);
  }, [color]);

  const updateColor = (next: string, preview = false) => {
    const nextColor = showOpacity ? colorWithOpacity(next, parsedColor.opacity) : next;
    setPickerColor(parseColor(nextColor).hex);

    if (preview) {
      onPreview(nextColor);
    }

    onChange(nextColor);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#999',
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
        }}
      >
        <input
          type="color"
          value={pickerColor}
          onFocus={onStart}
          onInput={(event) => updateColor(event.currentTarget.value, true)}
          onChange={(event) => updateColor(event.currentTarget.value, true)}
          style={{
            width: 36,
            height: 32,
            padding: 2,
            border: '1px solid #444',
            borderRadius: 5,
            background: '#181818',
            cursor: 'pointer',
          }}
        />

        <input
          type="text"
          data-editor-color="true"
          value={color}
          onChange={(event) => updateColor(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            minWidth: 0,
            height: 32,
            boxSizing: 'border-box',
            padding: '0 8px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#181818',
            color: '#fff',
            outline: 'none',
            fontSize: 12,
          }}
        />
      </div>
      {showOpacity && (
        <label
          style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: '#999' }}
        >
          {uiText(language, 'backgroundOpacity')}: {Math.round((1 - parsedColor.opacity) * 100)}%
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round((1 - parsedColor.opacity) * 100)}
            onFocus={onStart}
            onChange={(event) => {
              const next = colorWithOpacity(color, 1 - Number(event.target.value) / 100);
              setPickerColor(parseColor(next).hex);
              onPreview(next);
              onChange(next);
            }}
            onBlur={onBlur}
            style={{ width: '100%', accentColor: '#60a5fa' }}
          />
        </label>
      )}
    </div>
  );
};

export const InspectorAppearanceSection: React.FC<InspectorAppearanceSectionProps> = ({
  color,
  backgroundColor,
  fontSize,
  fontWeight,
  fontFamily,
  onFontSizeChange,
  onFontWeightChange,
  onFontFamilyChange,
  onColorPreview,
  onColorChange,
  onColorStart,
  onBackgroundColorPreview,
  onBackgroundColorChange,
  onBackgroundColorStart,
  onFocus,
  onBlur,
}) => {
  const { translations: t } = useI18n();

  return (
    <>
      <div
        style={{
          paddingTop: 4,
          borderTop: '1px solid #333',
        }}
      />

      <NumberInput
        label={t.inspector.fontSize}
        value={fontSize}
        min={1}
        onFocus={onFocus}
        onChange={onFontSizeChange}
        onBlur={onBlur}
      />

      <NumberInput
        label={t.inspector.fontWeight}
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        onFocus={onFocus}
        onChange={onFontWeightChange}
        onBlur={onBlur}
      />

      {fontFamily !== undefined && onFontFamilyChange && (
        <SelectInput
          label={t.inspector.fontFamily}
          value={fontFamily}
          options={[
            { value: 'Arial, sans-serif', label: 'Arial' },
            { value: 'Inter, sans-serif', label: 'Inter' },
            { value: 'Roboto, sans-serif', label: 'Roboto' },
            { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
            { value: 'Verdana, sans-serif', label: 'Verdana' },
            { value: 'Tahoma, sans-serif', label: 'Tahoma' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Times New Roman, serif', label: 'Times New Roman' },
            { value: 'Courier New, monospace', label: 'Courier New' },
            { value: 'system-ui, sans-serif', label: 'System UI' },
          ]}
          onFocus={onFocus}
          onChange={onFontFamilyChange}
          onBlur={onBlur}
        />
      )}

      <ColorControl
        label={t.inspector.color}
        color={color}
        onPreview={onColorPreview}
        onChange={onColorChange}
        onStart={onColorStart}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      <ColorControl
        label={t.inspector.backgroundColor}
        color={backgroundColor}
        onPreview={onBackgroundColorPreview}
        onChange={onBackgroundColorChange}
        onStart={onBackgroundColorStart}
        onFocus={onFocus}
        onBlur={onBlur}
        showOpacity
      />
    </>
  );
};
