export type EditorTheme = 'classic' | 'graphite' | 'ocean' | 'plum';

export type EditorThemePalette = {
  page: string;
  panel: string;
  raised: string;
  deep: string;
  text: string;
  muted: string;
  border: string;
};

export const EDITOR_THEME_PALETTES: Record<EditorTheme, EditorThemePalette> = {
  classic: {
    page: '#181818',
    panel: '#202020',
    raised: '#292929',
    deep: '#111827',
    text: '#ffffff',
    muted: '#94a3b8',
    border: '#3b3b3b',
  },
  graphite: {
    page: '#171b22',
    panel: '#222832',
    raised: '#2d3542',
    deep: '#121720',
    text: '#edf2f7',
    muted: '#a6b1c2',
    border: '#3d4858',
  },
  ocean: {
    page: '#071a24',
    panel: '#0c2735',
    raised: '#123747',
    deep: '#06141d',
    text: '#e3f7ff',
    muted: '#8fb9c9',
    border: '#245064',
  },
  plum: {
    page: '#1b1422',
    panel: '#291d34',
    raised: '#382746',
    deep: '#140e1b',
    text: '#f5eaff',
    muted: '#bba6ce',
    border: '#4d385f',
  },
};
