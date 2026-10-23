import type { LanguageCode, TranslationKeys } from './types';

import { ru } from './locales/ru';

import { en } from './locales/en';

import { es } from './locales/es';

import { zh } from './locales/zh';

import { hi } from './locales/hi';

import { it } from './locales/it';

import { de } from './locales/de';

import { DEFAULT_LANGUAGE } from './locale';

const locales: Record<LanguageCode, TranslationKeys> = {
  ru,
  en,
  es,
  zh,
  hi,
  it,
  de,
};

export function getTranslations(language: LanguageCode = DEFAULT_LANGUAGE): TranslationKeys {
  return locales[language];
}

export function translate(
  language: LanguageCode,
  selector: (translations: TranslationKeys) => string,
): string {
  return selector(getTranslations(language));
}

export function getLanguage(language?: string): LanguageCode {
  if (language && language in locales) {
    return language as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
}
