import type { LanguageCode } from './types';

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'it', label: 'Italiano' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
].sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
