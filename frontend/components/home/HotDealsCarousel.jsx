'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Heart, ShoppingCart } from 'lucide-react';
import { HOT_DEALS } from '../../lib/mockData';
import { formatCurrency, discountPercent } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import TelegramOrderModal from '../TelegramOrderModal';
import { tryFetchLiveProducts } from '../../lib/api';
import { useTranslation } from '../../lib/i18n/useTranslation';
import ProductThumb from '../ProductThumb';

function StockBar({ stock, threshold = 10 }) {
  const pct = Math.min(100, Math.round((stock / threshold) * 100));
  const low = stock <= 5;
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${low ? 'bg-heat' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {low && <p className="text-[11px] font-semibold text-heat mt-1">Only {stock} left in stock</p>}
    </div>
  );
}

function DealCard({ product }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const pct = discountPercent(product.price, product.discountPrice);

  return (
    <div className="relative flex-shrink-0 w-72 snap-start rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <span className="bg-heat text-white text-xs font-bold px-2 py-1 rounded-full">-{pct}%</span>
        <span className="flex items-center gap-1 bg-charcoal/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          <Flame size={10} className="text-amber-400" /> Hot Deal
        </span>
      </div>

      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:text-heat transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart size={15} />
      </button>

      <Link href={`/product/${product.slug}`} className="block h-40">
        <ProductThumb product={product} className="w-full h-full" />
      </Link>

      <div className="p-4">
        <p className="text-[11px] text-slate-400 mb-1">{product.brand} · SKU {product.sku}</p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-semibold text-charcoal leading-snug mb-2 hover:text-heat transition-colors line-clamp-2">
          {product.title}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-heat">{formatCurrency(product.discountPrice)}</span>
          <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>
        </div>

        <StockBar stock={product.stock} />

        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-charcoal text-white text-xs font-semibold py-2.5 rounded-full hover:bg-charcoal/90 transition-colors"
          >
            <ShoppingCart size={14} />
            {t('add_to_cart')}
          </button>
          <TelegramOrderModal product={product} label="1-Click" className="flex-1 !py-2.5 !text-xs" />
        </div>
      </div>
    </div>
  );
}

export default function HotDealsCarousel() {
  const { t } = useTranslation();
  // Same SSR-safe pattern as CatalogView: render the bundled deals first
  // (matches the server HTML), then swap in live admin-managed hot deals.
  const [deals, setDeals] = useState(HOT_DEALS);
  useEffect(() => {
    tryFetchLiveProducts('&hotDeal=true').then((live) => {
      if (live) setDeals(live.filter((p) => p.isHotDeal));
    });
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-heat mb-1">
            <Flame size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">Flash Sale</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal">Hot Deals of the Week</h2>
        </div>
        <Link href="/catalog?hotDeal=true" className="text-sm font-semibold text-heat hover:underline">
          {t('view_all')} →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 no-scrollbar">
        {deals.map((product) => (
          <DealCard key={product.sku} product={product} />
        ))}
      </div>
    </section>
  );
}
