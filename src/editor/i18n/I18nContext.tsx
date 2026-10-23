import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

import type { LanguageCode, TranslationKeys } from '../../domain/i18n/types';

import { getLanguage, getTranslations } from '../../domain/i18n/i18n';

import { DEFAULT_LANGUAGE } from '../../domain/i18n/locale';

const LANGUAGE_STORAGE_KEY = 'wallcut-ui-language-v2';
const LEGACY_LANGUAGE_STORAGE_KEY = 'finance-shorts-ui-language-v2';

type I18nContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: TranslationKeys;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: React.ReactNode;
  language?: LanguageCode;
};

function getStoredLanguage(): LanguageCode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedLanguage =
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);

    if (!storedLanguage) {
      return null;
    }

    return getLanguage(storedLanguage);
  } catch {
    return null;
  }
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  language: initialLanguage,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const storedLanguage = getStoredLanguage();

    if (storedLanguage) {
      return storedLanguage;
    }

    return initialLanguage ?? DEFAULT_LANGUAGE;
  });

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      } catch {
        // Ignore localStorage errors.
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore localStorage errors.
    }
  }, [language]);

  const translations = useMemo(() => getTranslations(language), [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      translations,
    }),
    [language, translations],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
}
