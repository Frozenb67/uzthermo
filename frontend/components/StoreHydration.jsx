'use client';

import { useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCompareStore } from '../store/useCompareStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';

/**
 * Every persisted Zustand store is created with `skipHydration: true` so the
 * first client render matches the server-rendered HTML exactly (both start
 * from the default empty state). Once mounted — after hydration is already
 * complete — this pulls the real values in from localStorage, so cart/wishlist/
 * compare counts and the logged-in user "pop in" instead of ever mismatching.
 * Renders nothing; mount this once near the root layout.
 */
export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useCompareStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    useLocaleStore.persist.rehydrate();
  }, []);

  return null;
}
