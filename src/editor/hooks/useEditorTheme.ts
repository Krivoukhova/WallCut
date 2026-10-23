import { useEffect, useState } from 'react';

import { EDITOR_THEME_PALETTES, type EditorTheme } from '../editorTheme';
import type { LanguageCode } from '../../domain/i18n/types';
import { applyEditorThemeStyles } from '../themeStyles';

export function useEditorTheme(language: LanguageCode | undefined) {
  const [theme, setTheme] = useState<EditorTheme>(() => {
    try {
      const saved = (window.localStorage.getItem('wallcut-editor-theme') ??
        window.localStorage.getItem('finance-shorts-editor-theme'));
      return saved === 'graphite' || saved === 'ocean' || saved === 'plum' ? saved : 'classic';
    } catch {
      return 'classic';
    }
  });

  useEffect(() => {
    const palette = EDITOR_THEME_PALETTES[theme];
    document.documentElement.style.margin = '0';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.documentElement.style.background = palette.page;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.background = palette.page;
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.margin = '0';
      root.style.background = palette.page;
    }
    try {
      window.localStorage.setItem('wallcut-editor-theme', theme);
    } catch {
      /* storage may be unavailable */
    }

    applyEditorThemeStyles(theme, palette, language);
    return () => {
      /* Keep the selected theme active while the editor is mounted. */
    };
  }, [language, theme]);
  return [theme, setTheme] as const;
}
