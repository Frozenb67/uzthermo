'use client';

import { useCallback } from 'react';
import { useLocaleStore } from '../../store/useLocaleStore';
import { dictionaries, DEFAULT_LOCALE } from './dictionaries';

/**
 * const { t, locale, setLocale } = useTranslation();
 * t('add_to_cart') -> current-locale string, falling back to Uzbek, falling
 * back to the raw key so a missing translation never breaks the UI.
 * t('only_left_in_stock', { n: 4 }) -> supports {placeholder} interpolation.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (key, vars) => {
      const template =
        dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE]?.[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (str, [k, v]) => str.replaceAll(`{${k}}`, v),
        template
      );
    },
    [locale]
  );

  return { t, locale, setLocale };
}
