import React, { useRef } from 'react';
import { Img } from 'remotion';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import { useI18n } from '../i18n/I18nContext';
import { uiText } from '../../domain/i18n/uiText';

type Props = {
  value: BackgroundStyle;
  onChange: (value: BackgroundStyle) => void;
  label?: string;
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '7px 8px',
  borderRadius: 6,
  border: '1px solid #444',
  background: '#171717',
  color: '#fff',
  fontSize: 12,
};
const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 11,
  color: '#aaa',
};

/** Shared project/scene background editor. Image data is embedded to keep the background portable with the project document. */
export const BackgroundControls: React.FC<Props> = ({ value, onChange, label }) => {
  const { language } = useI18n();
  const text = (key: Parameters<typeof uiText>[1]) => uiText(language, key);
  const fileRef = useRef<HTMLInputElement>(null);
  const kind = value.type;
  const imageSource = value.type === 'image' ? value.assetId : '';
  const setType = (type: string) => {
    if (type === 'solid')
      onChange({ type: 'solid', color: value.type === 'solid' ? value.color : '#111318' });
    if (type === 'gradient')
      onChange(
        value.type === 'gradient'
          ? value
          : {
              type: 'gradient',
              angle: 135,
              stops: [
                { color: '#172554', position: 0 },
                { color: '#7c3aed', position: 100 },
              ],
            },
      );
    if (type === 'image' && value.type !== 'image')
      onChange({ type: 'image', assetId: '', fit: 'cover' });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={labelStyle}>
        {label ?? text('background')}
        <select value={kind} onChange={(e) => setType(e.target.value)} style={fieldStyle}>
          <option value="solid">{text('solidColor')}</option>
          <option value="gradient">{text('gradient')}</option>
          <option value="image">{text('image')}</option>
        </select>
      </label>
      <label style={labelStyle}>
        {text('backgroundOpacity')}: {Math.round((1 - (value.opacity ?? 1)) * 100)}%
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round((1 - (value.opacity ?? 1)) * 100)}
          onChange={(e) => onChange({ ...value, opacity: 1 - Number(e.target.value) / 100 })}
          style={{ width: '100%', accentColor: '#60a5fa' }}
        />
      </label>
      {value.type === 'solid' && (
        <label style={labelStyle}>
          {text('color')}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              aria-label={`${text('background')} — ${text('color').toLowerCase()}`}
              type="color"
              value={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.value })}
              style={{
                width: 38,
                height: 32,
                padding: 2,
                border: '1px solid #444',
                background: '#171717',
                borderRadius: 5,
              }}
            />
            <input
              value={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.value })}
              style={fieldStyle}
            />
          </div>
        </label>
      )}
      {value.type === 'gradient' && (
        <>
          <label style={labelStyle}>
            {text('gradientAngle')}
            <input
              type="number"
              min={0}
              max={360}
              value={value.angle}
              onChange={(e) =>
                onChange({
                  ...value,
                  angle: Math.max(0, Math.min(360, Number(e.target.value) || 0)),
                })
              }
              style={fieldStyle}
            />
          </label>
          {value.stops.slice(0, 2).map((stop, index) => (
            <label key={index} style={labelStyle}>
              {text('color')} {index + 1}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      stops: value.stops.map((s, i) =>
                        i === index ? { ...s, color: e.target.value } : s,
                      ),
                    })
                  }
                  style={{
                    width: 38,
                    height: 32,
                    padding: 2,
                    border: '1px solid #444',
                    background: '#171717',
                    borderRadius: 5,
                  }}
                />
                <input
                  value={stop.color}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      stops: value.stops.map((s, i) =>
                        i === index ? { ...s, color: e.target.value } : s,
                      ),
                    })
                  }
                  style={fieldStyle}
                />
              </div>
            </label>
          ))}
        </>
      )}
      {value.type === 'image' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              if (!file.type.startsWith('image/')) {
                input.value = '';
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string')
                  onChange({
                    type: 'image',
                    assetId: reader.result,
                    fit: value.type === 'image' ? (value.fit ?? 'cover') : 'cover',
                  });
              };
              reader.readAsDataURL(file);
              input.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ ...fieldStyle, cursor: 'pointer' }}
          >
            {imageSource.startsWith('data:image/') ? text('replaceImage') : text('chooseImage')}
          </button>
          {imageSource.startsWith('data:image/') && (
            <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #444' }}>
              <Img
                src={imageSource}
                alt={text('backgroundPreview')}
                style={{ display: 'block', width: '100%', maxHeight: 120, objectFit: 'cover' }}
              />
            </div>
          )}
          <label style={labelStyle}>
            {text('scaling')}
            <select
              value={value.fit ?? 'cover'}
              onChange={(e) => onChange({ ...value, fit: e.target.value as 'cover' | 'contain' })}
              style={fieldStyle}
            >
              <option value="cover">{text('fillFrame')}</option>
              <option value="contain">{text('fitEntirely')}</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
};
