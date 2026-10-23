import type { LanguageCode, LocaleCode } from './types';

export const LANGUAGE_TO_LOCALE: Record<LanguageCode, LocaleCode> = {
  ru: 'ru-RU',
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN',
  it: 'it-IT',
  de: 'de-DE',
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const DEFAULT_LOCALE: LocaleCode = 'en-US';

export function getLocale(language: LanguageCode): LocaleCode {
  return LANGUAGE_TO_LOCALE[language];
}
