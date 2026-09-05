'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Sparkles, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../lib/utils';
import CheckoutModal from '../../components/CheckoutModal';
import { useTranslation } from '../../lib/i18n/useTranslation';
import ProductThumb from '../../components/ProductThumb';

export default function CartPage() {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const savings = items.reduce(
    (sum, i) => sum + Math.max(0, (i.originalPrice || i.price) - i.price) * i.qty,
    0
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingCart size={40} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-charcoal mb-2">{t('cart_empty')}</h1>
        <p className="text-sm text-slate-400 mb-6">{t('cart_empty_sub')}</p>
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
      <h1 className="text-2xl font-bold text-charcoal mb-6">{t('your_cart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.itemKey || item.sku}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
            >
              <Link href={`/product/${item.slug}`} className="block w-20 h-20 shrink-0">
                <ProductThumb product={item} className="w-full h-full rounded-xl" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="block text-sm font-semibold text-charcoal hover:text-heat transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-400 mt-1">
                  SKU {item.sku} · {item.selectedVariant?.size || item.selectedUnit}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-heat">{formatCurrency(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-slate-400 line-through">{formatCurrency(item.originalPrice)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center border border-slate-200 rounded-full shrink-0">
                <button
                  type="button"
                  onClick={() => updateQty(item.itemKey || item.sku, item.qty - 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-heat"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.itemKey || item.sku, item.qty + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-heat"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              <p className="w-28 text-right text-sm font-bold text-charcoal shrink-0">
                {formatCurrency(item.price * item.qty)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.itemKey || item.sku)}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-heat hover:bg-heat/5 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-charcoal mb-4">{t('order_summary')}</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-slate-500">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(subtotal + savings)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} /> {t('youre_saving')}
                  </span>
                  <span>-{formatCurrency(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-slate-100">
                <span>{t('total')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <CheckoutModal className="w-full" triggerLabel={t('proceed_checkout')} />

            <Link
              href="/catalog"
              className="block text-center text-xs text-slate-400 hover:text-heat mt-4"
            >
              {t('continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
