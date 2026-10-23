import { uiText } from '../domain/i18n/uiText';
import type { LanguageCode } from '../domain/i18n/types';
import type { EditorTheme, EditorThemePalette } from './editorTheme';

/** Applies the editor's theme-specific CSS overrides without owning React state. */
export function applyEditorThemeStyles(theme: EditorTheme, palette: EditorThemePalette, language: LanguageCode | undefined): void {
    const styleId = 'wallcut-theme-overrides';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    const targets: Array<[string, string]> = [
      ['#181818', palette.page],
      ['#1b1b1b', palette.page],
      ['#191919', palette.page],
      ['#151515', palette.page],
      ['#111', palette.deep],
      ['#111111', palette.deep],
      ['#202020', palette.panel],
      ['#1f1f1f', palette.panel],
      ['#1e1e1e', palette.panel],
      ['#1d1d1d', palette.panel],
      ['#1c1c1c', palette.panel],
      ['#242424', palette.panel],
      ['#252525', palette.panel],
      ['#262626', palette.panel],
      ['#292929', palette.raised],
      ['#2a2a2a', palette.raised],
      ['#2b2b2b', palette.raised],
      ['#2c2c2c', palette.raised],
      ['#303030', palette.raised],
      ['#333', palette.raised],
      ['#333333', palette.raised],
      ['#111827', palette.deep],
      ['#1f2937', palette.deep],
      ['#242424', palette.panel],
      // Timeline and inspector use a second family of dark navy/gray surfaces.
      ['#0b0f17', palette.page],
      ['#0d1522', palette.panel],
      ['#172033', palette.raised],
      ['#0f172a', palette.panel],
      ['#101827', palette.panel],
      ['#131c2b', palette.panel],
      ['#162033', palette.raised],
      ['#1a2436', palette.raised],
      ['#202b3d', palette.raised],
      ['#0c1420', palette.page],
      ['#121a27', palette.panel],
      ['#1b2638', palette.raised],
      ['#263244', palette.raised],
      ['#2b3648', palette.raised],
      ['#303b4d', palette.raised],
    ];
    const backgroundRules = targets
      .map(
        ([value, color]) =>
          `#root [data-app-theme="${theme}"] [style*="${value}"] { background-color: ${color} !important; }`,
      )
      .join('\n');
    const surfaceRules = `
      [data-app-theme="${theme}"] [style*="backgroundColor: rgb(32, 32, 32)"],
      [data-app-theme="${theme}"] [style*="background: rgb(32, 32, 32)"] { background-color: var(--fs-panel) !important; }
      [data-app-theme="${theme}"] [style*="backgroundColor: rgb(41, 41, 41)"],
      [data-app-theme="${theme}"] [style*="background: rgb(41, 41, 41)"] { background-color: var(--fs-raised) !important; }
      [data-app-theme="${theme}"] [style*="borderColor"],
      [data-app-theme="${theme}"] [style*="border: 1px solid"] { border-color: var(--fs-border) !important; }
      [data-app-theme="${theme}"] [style*="boxShadow"] { box-shadow: 0 1px 0 color-mix(in srgb, var(--fs-border) 55%, transparent) !important; }
    `;
    style.textContent = `

      [data-app-theme="${theme}"] {
        --fs-page: ${palette.page}; --fs-panel: ${palette.panel}; --fs-raised: ${palette.raised};
        --fs-deep: ${palette.deep}; --fs-text: ${palette.text}; --fs-muted: ${palette.muted}; --fs-border: ${palette.border};
        background: var(--fs-page) !important; color: var(--fs-text) !important;
        color-scheme: dark;
      }
      [data-app-theme="${theme}"] > div,
      [data-app-theme="${theme}"] [style*="borderBottom"],
      [data-app-theme="${theme}"] [style*="borderTop"],
      [data-app-theme="${theme}"] [style*="border:"] { border-color: var(--fs-border) !important; }
      [data-app-theme="${theme}"] input,
      [data-app-theme="${theme}"] textarea,
      [data-app-theme="${theme}"] select,
      [data-app-theme="${theme}"] option { background-color: var(--fs-raised) !important; color: var(--fs-text) !important; border-color: var(--fs-border) !important; }
      [data-app-theme="${theme}"] button { border-color: var(--fs-border); }
      [data-app-theme="${theme}"] [data-audio-track] { background: var(--fs-panel) !important; border-color: var(--fs-border) !important; }
      [data-app-theme="${theme}"] [data-audio-track] > div { background-color: var(--fs-panel) !important; color: var(--fs-muted) !important; }
      [data-app-theme="${theme}"] [data-audio-track] button { background-color: var(--fs-raised) !important; color: var(--fs-text) !important; }

      [data-app-theme="${theme}"] [data-audio-clip] { background: rgba(59,130,246,0.30) !important; background-color: rgba(59,130,246,0.30) !important; border-color: rgba(96,165,250,0.85) !important; }
      [data-app-theme="${theme}"] [data-audio-clip] > div { background: transparent !important; color: #bfdbfe !important; }
      [data-app-theme="${theme}"] [data-inspector-section],
      [data-app-theme="${theme}"] [data-inspector-group],
      [data-app-theme="${theme}"] [data-inspector-content] { background-color: var(--fs-panel) !important; border-color: var(--fs-border) !important; color: var(--fs-text) !important; }
      [data-app-theme="${theme}"] [style*="background: #0d1522"],
      [data-app-theme="${theme}"] [style*="background: #172033"],
      [data-app-theme="${theme}"] [style*="background: #0b0f17"] { background-color: var(--fs-panel) !important; }
      [data-app-theme="${theme}"] [style*="background: #1b1b1b"],
      [data-app-theme="${theme}"] [style*="background: #292929"] { background-color: var(--fs-raised) !important; }
      [data-app-theme="${theme}"] button:not([style*="background: transparent"]):not([style*="background-color: transparent"]) { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fs-border) 35%, transparent); }

      [data-app-theme="${theme}"] { --fs-radius: 9px; }
      [data-app-theme="${theme}"] input:not([type="checkbox"]):not([type="range"]),
      [data-app-theme="${theme}"] textarea,
      [data-app-theme="${theme}"] select { border-radius: 7px !important; padding: 7px 9px; box-sizing: border-box; max-width: 100%; }

      [data-app-theme="${theme}"] input[type="range"] { display: block; width: 100% !important; max-width: 100%; min-width: 0; box-sizing: border-box; padding: 0 !important; margin: 6px 0; border: 0 !important; background: transparent !important; accent-color: var(--fs-muted); }
      [data-app-theme="${theme}"] input[type="checkbox"],
      [data-app-theme="${theme}"] input[type="radio"] { accent-color: var(--fs-muted) !important; }

      [data-app-theme="${theme}"] input,
      [data-app-theme="${theme}"] textarea,
      [data-app-theme="${theme}"] select { accent-color: var(--fs-muted) !important; }
      [data-app-theme="${theme}"] input:focus,
      [data-app-theme="${theme}"] textarea:focus,
      [data-app-theme="${theme}"] select:focus {
        outline: 1px solid var(--fs-border) !important;
        border-color: var(--fs-border) !important;
        box-shadow: none !important;
      }
      [data-app-theme="${theme}"] [data-editor-block][data-dragging="true"] {
        z-index: 100 !important;
        opacity: .96;
        filter: brightness(1.14);
        box-shadow: 0 0 0 2px rgba(255,255,255,.72), 0 8px 18px rgba(0,0,0,.35) !important;
        cursor: grabbing !important;
      }
      [data-app-theme="${theme}"] [data-inspector-content] input[type="range"] { width: 100% !important; max-width: 100%; box-sizing: border-box; padding: 0 !important; }
      [data-app-theme="${theme}"] button { border-radius: 7px; transition: background-color .12s ease, border-color .12s ease, transform .12s ease; }
      [data-app-theme="${theme}"] button:hover { filter: brightness(1.12); }

      [data-app-theme="${theme}"] [data-inspector-section],
      [data-app-theme="${theme}"] [data-inspector-group] { border-radius: 9px 0 0 9px !important; margin-bottom: 8px; overflow: hidden; }
      [data-app-theme="${theme}"] .fs-editor-inspector::-webkit-scrollbar { width: 6px; }
      [data-app-theme="${theme}"] .fs-editor-inspector { scrollbar-width: thin; scrollbar-color: #505866 transparent; }
      [data-app-theme="${theme}"] .fs-editor-inspector::-webkit-scrollbar-track { background: transparent; }
      [data-app-theme="${theme}"] .fs-editor-inspector::-webkit-scrollbar-thumb { background: #505866; border: 0; border-radius: 999px; }
      [data-app-theme="${theme}"] [data-audio-track] { background: var(--fs-panel) !important; }
      [data-app-theme="${theme}"] [data-audio-clip] { box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 2px 8px rgba(0,0,0,.18); }
      [data-app-theme="${theme}"] [data-audio-clip] > div:first-child { background: transparent !important; color: #dbeafe !important; }
      [data-app-theme="${theme}"] [data-inspector-content] input,
      [data-app-theme="${theme}"] [data-inspector-content] textarea,
      [data-app-theme="${theme}"] [data-inspector-content] select { width: 100%; box-sizing: border-box; }
      [data-app-theme="${theme}"] [style*="borderRadius: 4"],
      [data-app-theme="${theme}"] [style*="borderRadius: 5"] { border-radius: 7px !important; }
      [data-app-theme="${theme}"] [style*="background: rgb(24, 24, 24)"],
      [data-app-theme="${theme}"] [style*="background: rgb(17, 24, 39)"],
      [data-app-theme="${theme}"] [style*="background: rgb(15, 23, 42)"] { background: var(--fs-deep) !important; }
      [data-app-theme="${theme}"] [style*="background: transparent"] { background-color: transparent !important; }
      [data-app-theme="${theme}"] [style*="color: #777"],
      [data-app-theme="${theme}"] [style*="color: #888"],
      [data-app-theme="${theme}"] [style*="color: #94a3b8"],
      [data-app-theme="${theme}"] [style*="color: #9ca3af"],
      [data-app-theme="${theme}"] [style*="color: #a1a1aa"] { color: var(--fs-muted) !important; }
      [data-app-theme="${theme}"] [style*="color: rgb(255, 255, 255)"],
      [data-app-theme="${theme}"] [style*="color: #fff"],
      [data-app-theme="${theme}"] [style*="color: white"] { color: ${palette.text} !important; }

      [data-app-theme="${theme}"] .fs-editor-header {
        height: 58px !important; min-height: 58px; box-sizing: border-box;
        padding: 0 18px !important; gap: 14px; position: relative;
        background: linear-gradient(180deg, color-mix(in srgb, var(--fs-panel) 94%, white 6%), var(--fs-panel)) !important;
        border-bottom: 1px solid var(--fs-border) !important;
        box-shadow: 0 5px 18px rgba(0,0,0,.16);
      }
      [data-app-theme="${theme}"] .fs-header-main-actions { gap: 7px !important; }
      [data-app-theme="${theme}"] .fs-header-settings { gap: 8px !important; }
      [data-app-theme="${theme}"] .fs-header-button {
        min-height: 33px !important; padding: 0 12px !important; border-radius: 8px !important;
        font-size: 12px !important; font-weight: 650 !important; letter-spacing: .01em;
        background: var(--fs-raised) !important; border: 1px solid var(--fs-border) !important;
        color: var(--fs-text) !important; box-shadow: 0 1px 0 rgba(255,255,255,.035), 0 2px 5px rgba(0,0,0,.12) !important;
      }
      [data-app-theme="${theme}"] .fs-header-dashboard { margin-right: 7px; }
      [data-app-theme="${theme}"] .fs-header-save { margin-left: 8px !important; border-color: color-mix(in srgb, var(--fs-accent, #60a5fa) 50%, var(--fs-border)) !important; }
      [data-app-theme="${theme}"] .fs-header-export {
        min-height: 35px !important; padding: 0 17px !important; border-radius: 9px !important;
        background: linear-gradient(135deg, #438bff, #2864d8) !important; border-color: #5797ff !important;
        color: white !important; box-shadow: 0 3px 10px rgba(37,99,235,.28) !important;
      }
      [data-app-theme="${theme}"] .fs-editor-header select { min-height: 33px; padding: 0 10px !important; border-radius: 8px !important; }
      [data-app-theme="${theme}"] .fs-editor-library {
        border: 1px solid var(--fs-border) !important; border-left: 0 !important; border-radius: 0 8px 8px 0 !important;
        background: linear-gradient(180deg, var(--fs-panel), color-mix(in srgb, var(--fs-panel) 88%, var(--fs-deep))) !important;
        width: 100% !important; min-width: 0 !important; max-width: 100% !important;
        box-sizing: border-box !important; margin: 0 !important; padding: 14px 11px !important;
        box-shadow: 0 7px 22px rgba(0,0,0,.13);
      }
      [data-app-theme="${theme}"] .fs-editor-library > div:first-child,
      [data-app-theme="${theme}"] .fs-editor-inspector > div:first-child {
        font-size: 11px !important; font-weight: 800 !important; letter-spacing: .09em;
        text-transform: uppercase; color: var(--fs-muted) !important; margin-bottom: 14px !important;
      }
      [data-app-theme="${theme}"] .fs-library-item {
        min-height: 66px !important; border-radius: 0 8px 8px 0 !important; gap: 7px !important;
        background: linear-gradient(145deg, var(--fs-raised), color-mix(in srgb, var(--fs-raised) 78%, var(--fs-deep))) !important;
        border: 1px solid var(--fs-border) !important; color: var(--fs-text) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.045), 0 2px 4px rgba(0,0,0,.10) !important;
      }
      [data-app-theme="${theme}"] .fs-library-item:hover {
        transform: translateY(-1px); border-color: #5797ff !important;
        background: color-mix(in srgb, var(--fs-raised) 82%, #2563eb) !important;
      }
      /* Keep the library flush on the left and leave room around the slim scrollbar. */
      [data-app-theme="${theme}"] .fs-editor-library,
      [data-app-theme="${theme}"] .fs-editor-library + * {
        scrollbar-width: thin;
        scrollbar-color: #505866 transparent;
      }
      [data-app-theme="${theme}"] .fs-editor-library::-webkit-scrollbar,
      [data-app-theme="${theme}"] .fs-editor-library + *::-webkit-scrollbar { width: 6px; }
      [data-app-theme="${theme}"] .fs-editor-library::-webkit-scrollbar-track,
      [data-app-theme="${theme}"] .fs-editor-library + *::-webkit-scrollbar-track { background: transparent; }
      [data-app-theme="${theme}"] .fs-editor-library::-webkit-scrollbar-thumb,
      [data-app-theme="${theme}"] .fs-editor-library + *::-webkit-scrollbar-thumb {
        background: #505866; border: 0; border-radius: 999px;
        box-shadow: inset 0 8px transparent, inset 0 -8px transparent;
      }
      [data-app-theme="${theme}"] .fs-editor-inspector {
        width: 100% !important; min-width: 0 !important; max-width: 100% !important;
        box-sizing: border-box !important; flex: 1 1 auto !important;
        border: 1px solid var(--fs-border) !important; border-radius: 9px 0 0 9px !important;
        background: linear-gradient(180deg, var(--fs-panel), color-mix(in srgb, var(--fs-panel) 92%, var(--fs-deep))) !important;
        margin: 0 !important; padding: 14px !important;
        box-shadow: 0 7px 22px rgba(0,0,0,.13);
      }
      [data-app-theme="${theme}"] .fs-editor-inspector label { color: var(--fs-muted) !important; gap: 7px !important; }
      [data-app-theme="${theme}"] .fs-editor-inspector input:not([type="checkbox"]),
      [data-app-theme="${theme}"] .fs-editor-inspector textarea,
      [data-app-theme="${theme}"] .fs-editor-inspector select {
        min-height: 32px; border-radius: 8px !important; background: var(--fs-deep) !important;
        border: 1px solid var(--fs-border) !important; box-shadow: inset 0 1px 2px rgba(0,0,0,.12);
      }
      [data-app-theme="${theme}"] .fs-editor-inspector button {
        border-radius: 8px !important; border-color: var(--fs-border) !important;
      }
      [data-app-theme="${theme}"] [style*="background: #111111"][style*="borderTop"],
      [data-app-theme="${theme}"] [style*="background: rgb(17, 17, 17)"][style*="borderTop"] {
        background: var(--fs-panel) !important; border-color: var(--fs-border) !important;
      }
      [data-app-theme="${theme}"] [style*="gridTemplateColumns: repeat(2, minmax(0, 1fr))"] { gap: 8px !important; }
      [data-app-theme="${theme}"] [data-audio-clip] { background: rgba(59,130,246,.34) !important; border: 1px solid rgba(96,165,250,.95) !important; }
      /* Keep resize grips visible: clipping the block itself hides handles at its edges. */
      [data-app-theme="${theme}"] [data-editor-block] { overflow: visible !important; }
      [data-app-theme="${theme}"] [data-editor-block] [data-resize-handle] {
        width: 6px !important;
        background: rgba(255,255,255,.22) !important;
        border: 0 !important;
        border-radius: 3px !important;
        opacity: .75;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.10);
        transition: background .14s ease, opacity .14s ease;
      }
      [data-app-theme="${theme}"] [data-editor-block] [data-resize-handle]:hover { opacity: 1; background: rgba(255,255,255,.78) !important; }
      /* The inspector resize area stays interactive but never becomes visible on hover. */
      [data-app-theme="${theme}"] [role="separator"][aria-label="${uiText(language ?? 'en', 'resizeInspector')}"],
      [data-app-theme="${theme}"] [role="separator"][aria-label="${uiText(language ?? 'en', 'resizeInspector')}"]:hover { background: transparent !important; box-shadow: none !important; }
      [data-app-theme="${theme}"] [role="separator"][aria-label="${uiText(language ?? 'en', 'resizeInspector')}"] > div { opacity: 0 !important; background: transparent !important; }
      [data-app-theme="${theme}"] [style*="color: #cbd5e1"],
      [data-app-theme="${theme}"] [style*="color: #e5e7eb"] { color: ${palette.text} !important; }
      [data-app-theme="${theme}"] [style*="color: #94a3b8"],
      [data-app-theme="${theme}"] [style*="color: #9ca3af"],
      [data-app-theme="${theme}"] [style*="color: #a1a1aa"] { color: ${palette.muted} !important; }
      [data-app-theme="${theme}"] [style*="#444"],
      [data-app-theme="${theme}"] [style*="#555"],
      [data-app-theme="${theme}"] [style*="#333"],
      [data-app-theme="${theme}"] [style*="#3a3a3a"] { border-color: ${palette.border} !important; }
      ${backgroundRules}
      ${surfaceRules}
    `;

}
