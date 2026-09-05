import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [], // full product objects for the /compare table

      addItem: (product) =>
        set((state) => {
          if (state.items.some((i) => i.sku === product.sku)) return state;
          if (state.items.length >= MAX_COMPARE_ITEMS) return state;
          return { items: [...state.items, product] };
        }),

      removeItem: (sku) => set((state) => ({ items: state.items.filter((i) => i.sku !== sku) })),
      clearCompare: () => set({ items: [] }),

      isComparing: (sku) => get().items.some((i) => i.sku === sku),
      count: () => get().items.length,
      isFull: () => get().items.length >= MAX_COMPARE_ITEMS,
    }),
    { name: 'uzthermo-compare', skipHydration: true }
  )
);
