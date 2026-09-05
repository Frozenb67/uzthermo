import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LOCALE } from '../lib/i18n/dictionaries';

export const useLocaleStore = create(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'uzthermo-locale',
      // Same hydration-mismatch guard as the other persisted stores: server
      // always renders the default locale (Uzbek), so the client's first
      // render must too — the real saved preference is applied post-mount by
      // <StoreHydration />.
      skipHydration: true,
    }
  )
);
