'use client';

import Link from 'next/link';
import { ShoppingCart, PackageX } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { useTranslation } from '../../lib/i18n/useTranslation';

function specsSummary(specifications = {}) {
  const bits = [];
  if (specifications.powerKW) bits.push(`${specifications.powerKW} kW`);
  if (specifications.diameter) bits.push(specifications.diameter);
  return bits.length ? bits.join(' · ') : '—';
}

export default function ProductTableView({ products }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);

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
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Brand</th>
            <th className="px-4 py-3">Specs</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const effectivePrice = product.discountPrice || product.price;
            const outOfStock = product.stock === 0;
            return (
              <tr key={product.sku} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <Link href={`/product/${product.slug}`} className="font-medium text-charcoal hover:text-heat transition-colors line-clamp-1">
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">{product.sku}</td>
                <td className="px-4 py-3 text-slate-600">{product.brand}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{specsSummary(product.specifications)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{product.unit}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${outOfStock ? 'text-slate-400' : product.stock <= 5 ? 'text-heat' : 'text-emerald-600'}`}>
                    {outOfStock ? t('out_of_stock') : `${product.stock} ${product.unit}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-charcoal whitespace-nowrap">
                  {formatCurrency(effectivePrice)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => addItem(product)}
                    disabled={outOfStock}
                    className="flex items-center gap-1.5 bg-charcoal text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={13} />
                    Add
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
