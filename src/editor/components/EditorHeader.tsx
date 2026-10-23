import React, { useState } from 'react';

import { useI18n } from '../i18n/I18nContext';

import type { LanguageCode } from '../../domain/i18n/types';
import { LANGUAGE_OPTIONS } from '../../domain/i18n/languageOptions';

import { HotkeyButton } from './HotkeyButton';

import type { ExportFormat } from '../export/exportService';

import type { EditorTheme } from '../editorTheme';

type EditorHeaderProps = {
  theme: EditorTheme;
  onThemeChange: (theme: EditorTheme) => void;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  currentFrame: number;

  onSave: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  canGroup?: boolean;
  canUngroup?: boolean;
  onDashboard: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting?: boolean;
  exportError?: string | null;
  setExportError?: (error: string | null) => void;
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  theme,
  onThemeChange,
  isDirty,
  canUndo,
  canRedo,
  currentFrame,
  onSave,
  isSaving = false,
  saveError = null,
  onUndo,
  onRedo,
  onGroup,
  onUngroup,
  canGroup = false,
  canUngroup = false,
  onDashboard,
  onExport,
  isExporting = false,
  exportError = null,
  setExportError,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState<ExportFormat>('mp4');
  const { language, setLanguage, translations } = useI18n();

  return (
    <div
      className="fs-editor-header"
      style={{
        height: 58,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid #333',
        background: '#202020',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <div
        className="fs-header-main-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={onDashboard}
          className="fs-header-button fs-header-dashboard"
          style={{
            height: 30,
            padding: '0 10px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#292929',
            color: '#fff',
            cursor: isSaving ? 'wait' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            fontSize: 12,
          }}
        >
          {translations.dashboard.title}
        </button>

        {translations.editor.title}

        <HotkeyButton
          hotkey="Ctrl+S"
          type="button"
          onClick={onSave}
          className="fs-header-button fs-header-save"
          disabled={isSaving}
          title={saveError ? `Save failed: ${saveError}` : undefined}
          style={{
            marginLeft: 20,
            height: 30,
            padding: '0 12px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#292929',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {translations.editor.save}
        </HotkeyButton>

        {saveError && (
          <span
            title={saveError}
            style={{
              marginLeft: 6,
              fontSize: 11,
              color: '#e57373',
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Save failed
          </span>
        )}

        <span
          style={{
            marginLeft: 4,
            fontSize: 11,
            color: isDirty ? '#f0ad4e' : '#777',
            minWidth: 62,
          }}
        >
          {isDirty ? translations.editor.unsaved : translations.editor.saved}
        </span>

        <HotkeyButton
          hotkey="Ctrl+Z"
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          style={{
            marginLeft: 20,
            height: 30,
            padding: '0 12px',
            border: '1px solid #444',
            borderRadius: 5,
            background: canUndo ? '#292929' : '#202020',
            color: canUndo ? '#fff' : '#666',
            cursor: canUndo ? 'pointer' : 'default',
            fontSize: 12,
          }}
        >
          ↶ {translations.editor.undo}
        </HotkeyButton>

        <HotkeyButton
          hotkey="Ctrl+G"
          type="button"
          disabled={!canGroup}
          onClick={onGroup}
          style={{
            height: 30,
            padding: '0 10px',
            border: '1px solid #444',
            borderRadius: 5,
            background: canGroup ? '#292929' : '#202020',
            color: canGroup ? '#fff' : '#666',
            cursor: canGroup ? 'pointer' : 'default',
            fontSize: 12,
          }}
        >
          Group
        </HotkeyButton>

        <HotkeyButton
          hotkey="Ctrl+Shift+G"
          type="button"
          disabled={!canUngroup}
          onClick={onUngroup}
          style={{
            height: 30,
            padding: '0 10px',
            border: '1px solid #444',
            borderRadius: 5,
            background: canUngroup ? '#292929' : '#202020',
            color: canUngroup ? '#fff' : '#666',
            cursor: canUngroup ? 'pointer' : 'default',
            fontSize: 12,
          }}
        >
          Ungroup
        </HotkeyButton>

        <HotkeyButton
          hotkey="Ctrl+Shift+Z"
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          style={{
            height: 30,
            padding: '0 12px',
            border: '1px solid #444',
            borderRadius: 5,
            background: canRedo ? '#292929' : '#202020',
            color: canRedo ? '#fff' : '#666',
            cursor: canRedo ? 'pointer' : 'default',
            fontSize: 12,
          }}
        >
          ↷ {translations.editor.redo}
        </HotkeyButton>
      </div>

      <div
        className="fs-header-settings"
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            opacity: 0.6,
            fontSize: 12,
            fontWeight: 400,
          }}
        >
          {translations.timeline.frame}: {currentFrame}
        </div>
        <button
          type="button"
          onClick={() => {
            setExportError?.(null);
            setExportOpen(true);
          }}
          className="fs-header-button fs-header-export"
          disabled={isExporting}
          style={{
            height: 30,
            padding: '0 14px',
            border: '1px solid #4f8cff',
            borderRadius: 5,
            background: '#3478f6',
            color: '#fff',
            cursor: isExporting ? 'wait' : 'pointer',
            opacity: isExporting ? 0.7 : 1,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {isExporting ? translations.editor.exporting : `⇩ ${translations.editor.export}`}
        </button>

        <select
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as EditorTheme)}
          aria-label={
            (
              {
                ru: 'Тема оформления',
                en: 'Editor theme',
                es: 'Tema del editor',
                zh: '编辑器主题',
                hi: 'एडिटर थीम',
                it: 'Tema editor',
              } as Record<string, string>
            )[language] ?? 'Editor theme'
          }
          title={
            (
              {
                ru: 'Тема оформления',
                en: 'Editor theme',
                es: 'Tema del editor',
                zh: '编辑器主题',
                hi: 'एडिटर थीम',
                it: 'Tema editor',
              } as Record<string, string>
            )[language] ?? 'Editor theme'
          }
          style={{
            height: 30,
            padding: '0 8px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#292929',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            outline: 'none',
          }}
        >
          <option value="classic">
            {(
              {
                ru: 'Тема: Классическая',
                en: 'Theme: Classic',
                es: 'Tema: Clásica',
                zh: '主题：经典',
                hi: 'थीम: क्लासिक',
                it: 'Tema: Classico',
              } as Record<string, string>
            )[language] ?? 'Theme: Classic'}
          </option>
          <option value="graphite">
            {(
              {
                ru: 'Тема: Графит',
                en: 'Theme: Graphite',
                es: 'Tema: Grafito',
                zh: '主题：石墨',
                hi: 'थीम: ग्रेफाइट',
                it: 'Tema: Grafite',
              } as Record<string, string>
            )[language] ?? 'Theme: Graphite'}
          </option>
          <option value="ocean">
            {(
              {
                ru: 'Тема: Океан',
                en: 'Theme: Ocean',
                es: 'Tema: Océano',
                zh: '主题：海洋',
                hi: 'थीम: महासागर',
                it: 'Tema: Oceano',
              } as Record<string, string>
            )[language] ?? 'Theme: Ocean'}
          </option>
          <option value="plum">
            {(
              {
                ru: 'Тема: Слива',
                en: 'Theme: Plum',
                es: 'Tema: Ciruela',
                zh: '主题：梅紫',
                hi: 'थीम: प्लम',
                it: 'Tema: Prugna',
              } as Record<string, string>
            )[language] ?? 'Theme: Plum'}
          </option>
        </select>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          aria-label={translations.common.language}
          style={{
            height: 30,
            padding: '0 8px',
            border: '1px solid #444',
            borderRadius: 5,
            background: '#292929',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            outline: 'none',
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option
              key={option.code}
              value={option.code}
              style={{
                background: '#292929',
                color: '#fff',
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {exportOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExportOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,.68)',
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            style={{
              width: 'min(520px, 100%)',
              background: '#242424',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: 12,
              padding: 22,
              boxShadow: '0 20px 70px rgba(0,0,0,.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 6,
              }}
            >
              <h2 id="export-dialog-title" style={{ margin: 0, fontSize: 18 }}>
                {translations.editor.exportTitle}
              </h2>
              <button
                type="button"
                aria-label={translations.editor.exportCancel}
                onClick={() => setExportOpen(false)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#aaa',
                  fontSize: 22,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '0 0 16px', color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>
              {translations.editor.exportDescription}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {(
                [
                  ['mp4', translations.editor.exportMp4, translations.editor.exportMp4Description],
                  [
                    'webm',
                    translations.editor.exportWebm,
                    translations.editor.exportWebmDescription,
                  ],
                ] as Array<[ExportFormat, string, string]>
              ).map(([format, label, description]) => (
                <label
                  key={format}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    border: `1px solid ${selectedExport === format ? '#3478f6' : '#444'}`,
                    borderRadius: 8,
                    padding: 11,
                    cursor: 'pointer',
                    background: selectedExport === format ? 'rgba(52,120,246,.12)' : '#292929',
                  }}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={format}
                    checked={selectedExport === format}
                    onChange={() => setSelectedExport(format)}
                    style={{ marginTop: 3, accentColor: '#3478f6' }}
                  />
                  <span style={{ display: 'block', minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 13 }}>{label}</strong>
                    <span
                      style={{
                        display: 'block',
                        marginTop: 3,
                        color: '#aaa',
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {exportError && (
              <p role="alert" style={{ color: '#ff9292', fontSize: 12, margin: '12px 0 0' }}>
                {exportError}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setExportOpen(false)}
                style={{
                  height: 34,
                  padding: '0 14px',
                  border: '1px solid #555',
                  borderRadius: 6,
                  background: '#2c2c2c',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {translations.editor.exportCancel}
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => {
                  void onExport(selectedExport)
                    .then(() => setExportOpen(false))
                    .catch(() => undefined);
                }}
                style={{
                  height: 34,
                  padding: '0 16px',
                  border: 0,
                  borderRadius: 6,
                  background: '#3478f6',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: isExporting ? 'wait' : 'pointer',
                  opacity: isExporting ? 0.7 : 1,
                }}
              >
                {isExporting ? translations.editor.exporting : translations.editor.export}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
