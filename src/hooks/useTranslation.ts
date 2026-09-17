import { useCallback, useEffect, useState } from 'react';

import { getCurrentLanguage, setCurrentLanguage } from '@/i18n/language';
import { translateUiKey, type TranslationKey } from '@/i18n/locales';
import type { SupportedLanguage } from '@/i18n/types';

export function useTranslation() {
  const [language, setLang] = useState<SupportedLanguage>(getCurrentLanguage);

  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: SupportedLanguage }>;
      if (customEvent.detail?.language) {
        setLang(customEvent.detail.language);
      } else {
        setLang(getCurrentLanguage());
      }
    };

    window.addEventListener('ninho:language-changed', handleLanguageChange);
    return () => {
      window.removeEventListener('ninho:language-changed', handleLanguageChange);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey | (string & {}), params?: Record<string, string | number>) => {
      return translateUiKey(key, language, params);
    },
    [language]
  );

  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    setCurrentLanguage(newLang);
    setLang(newLang);
  }, []);

  return {
    t,
    language,
    setLanguage: changeLanguage,
  };
}
