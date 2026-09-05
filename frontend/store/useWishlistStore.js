import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // { sku, slug, title, price, image }

      toggleItem: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.sku === product.sku);
          return {
            items: exists
              ? state.items.filter((i) => i.sku !== product.sku)
              : [...state.items, product],
          };
        }),

      isWishlisted: (sku) => get().items.some((i) => i.sku === sku),
      count: () => get().items.length,
    }),
    { name: 'uzthermo-wishlist', skipHydration: true }
  )
);
