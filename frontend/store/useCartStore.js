import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { sku, slug, title, price, image, qty, selectedUnit }

      addItem: (product, qty = 1, selectedUnit = product.unit || 'pcs', selectedVariant = null) =>
        set((state) => {
          const variants = Array.isArray(product?.variants) ? product.variants : [];
          const requestedVariant = variants.find((variant) => variant === selectedVariant || variant.size === selectedVariant?.size);
          const cartVariant = (requestedVariant && (requestedVariant.stock === undefined || requestedVariant.stock > 0))
            || variants.find((variant) => variant.stock === undefined || variant.stock > 0)
            || null;

          if (variants.length > 0 && !cartVariant) return state;

          const variantKey = cartVariant?.size || '';
          const itemKey = `${product.sku}::${variantKey}`;
          const existing = state.items.find((i) => i.itemKey === itemKey || (!i.itemKey && i.sku === product.sku && !variantKey));
          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.itemKey === itemKey || (!i.itemKey && i.sku === product.sku && !variantKey))
                  ? { ...i, qty: i.qty + qty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                sku: product.sku,
                itemKey,
                productId: product._id || null,
                slug: product.slug,
                title: product.title,
                price: cartVariant?.price ?? product.discountPrice ?? product.price,
                originalPrice: cartVariant?.originalPrice ?? product.price,
                image: product.image || product.images?.[0],
                qty,
                selectedUnit,
                selectedVariant: cartVariant,
              },
            ],
          };
        }),

      removeItem: (itemKey) => set((state) => ({ items: state.items.filter((i) => (i.itemKey || i.sku) !== itemKey) })),

      updateQty: (itemKey, qty) =>
        set((state) => ({
          items: state.items.map((i) => ((i.itemKey || i.sku) === itemKey ? { ...i, qty: Math.max(1, qty) } : i)),
        })),

      clearCart: () => set({ items: [] }),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      total: () => get().items.reduce((sum, i) => sum + i.qty * i.price, 0),
      savings: () =>
        get().items.reduce((sum, i) => sum + Math.max(0, (i.originalPrice || i.price) - i.price) * i.qty, 0),
    }),
    {
      name: 'uzthermo-cart',
      // Server always renders with the default empty state; reading localStorage
      // synchronously on the client during store creation would make the first
      // client render diverge from that HTML and trigger a hydration mismatch.
      // Rehydration is triggered manually, post-mount, by <StoreHydration />.
      skipHydration: true,
    }
  )
);
