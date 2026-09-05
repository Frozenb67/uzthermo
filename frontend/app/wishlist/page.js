'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency, discountPercent } from '../../lib/utils';
import { useTranslation } from '../../lib/i18n/useTranslation';
import ProductThumb from '../../components/ProductThumb';

export default function WishlistPage() {
  const { t } = useTranslation();
  const items = useWishlistStore((s) => s.items);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Heart size={40} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-charcoal mb-2">{t('wishlist_empty')}</h1>
        <p className="text-sm text-slate-400 mb-6">{t('wishlist_empty_sub')}</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-heat text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-heat/90 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('browse_catalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-charcoal mb-1">{t('your_wishlist')}</h1>
      <p className="text-sm text-slate-400 mb-6">{items.length} {t('saved_products')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => {
          const effectivePrice = product.discountPrice || product.price;
          const pct = discountPercent(product.price, product.discountPrice);
          return (
            <div
              key={product.sku}
              className="relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              {pct > 0 && (
                <span className="absolute top-3 left-3 z-10 bg-heat text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{pct}%
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-heat hover:bg-white transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={15} />
              </button>

              <Link href={`/product/${product.slug}`} className="block h-40">
                <ProductThumb product={product} className="w-full h-full" />
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <p className="text-[11px] text-slate-400 mb-1">{product.brand} · SKU {product.sku}</p>
                <Link
                  href={`/product/${product.slug}`}
                  className="block text-sm font-semibold text-charcoal leading-snug mb-2 hover:text-heat transition-colors line-clamp-2"
                >
                  {product.title}
                </Link>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-bold text-heat">{formatCurrency(effectivePrice)}</span>
                  {pct > 0 && <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>}
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="mt-auto flex items-center justify-center gap-1.5 bg-charcoal text-white text-xs font-semibold py-2.5 rounded-full hover:bg-charcoal/90 transition-colors"
                >
                  <ShoppingCart size={14} />
                  {t('add_to_cart')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
