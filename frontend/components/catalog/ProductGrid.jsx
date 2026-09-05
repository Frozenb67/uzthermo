'use client';

import Link from 'next/link';
import { Heart, GitCompare, ShoppingCart, PackageX } from 'lucide-react';
import { formatCurrency, discountPercent } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCompareStore } from '../../store/useCompareStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import ProductThumb from '../ProductThumb';

function ProductCard({ product }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.sku));
  const addToCompare = useCompareStore((s) => s.addItem);
  const isComparing = useCompareStore((s) => s.isComparing(product.sku));

  const effectivePrice = product.discountPrice || product.price;
  const pct = discountPercent(product.price, product.discountPrice);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        {pct > 0 && <span className="bg-heat text-white text-xs font-bold px-2 py-1 rounded-full">-{pct}%</span>}
        {outOfStock && (
          <span className="bg-slate-400 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            {t('out_of_stock')}
          </span>
        )}
        {!outOfStock && !lowStock && (
          <span className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            {t('in_stock')}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-colors ${
          isWishlisted ? 'text-heat' : 'hover:text-heat'
        }`}
        aria-label="Toggle wishlist"
      >
        <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
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

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-bold text-heat">{formatCurrency(effectivePrice)}</span>
          {pct > 0 && <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>}
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          {product.unit === 'meters' ? t('per_meter') : t('per_piece')}
          {lowStock && (
            <span className="text-heat font-semibold"> · {t('only_left_in_stock', { n: product.stock })}</span>
          )}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 bg-charcoal text-white text-xs font-semibold py-2.5 rounded-full hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {outOfStock ? <PackageX size={14} /> : <ShoppingCart size={14} />}
            {outOfStock ? t('unavailable') : t('add_to_cart')}
          </button>
          <button
            type="button"
            onClick={() => addToCompare(product)}
            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full border transition-colors ${
              isComparing ? 'border-heat text-heat bg-heat/5' : 'border-slate-200 text-slate-400 hover:border-heat hover:text-heat'
            }`}
            aria-label="Add to compare"
          >
            <GitCompare size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products }) {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageX size={32} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-charcoal mb-1">{t('no_products_match')}</p>
        <p className="text-xs text-slate-400">{t('no_products_match_sub')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}
