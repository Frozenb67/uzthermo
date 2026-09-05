'use client';

import Link from 'next/link';
import { GitCompare, X, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCompareStore } from '../../store/useCompareStore';
import { useCartStore } from '../../store/useCartStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import ProductThumb from '../../components/ProductThumb';

// For each characteristic, whether a HIGHER value is "better" (green) — price is the exception (lower is better).
const HIGHER_IS_BETTER = {
  price: false,
  // Default: assume higher is better for most characteristics
  // Override with false for characteristics where lower is better
};

function isNumeric(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return true;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function parseNumericValue(value) {
  if (typeof value === 'number') return value;
  // Try to extract numeric part from strings like "100 l", "850 mm", "45 кг"
  const match = String(value).match(/[\d.]+/);
  return match ? Number(match[0]) : NaN;
}

function generateDynamicRows(items, t) {
  // Collect all unique characteristic names from all products
  const allCharacteristicNames = new Set();
  
  items.forEach((product) => {
    if (product.specifications && typeof product.specifications === 'object') {
      Object.keys(product.specifications).forEach((name) => {
        allCharacteristicNames.add(name);
      });
    }
  });

  // Add standard fields at the top (Brand, Price, Unit, Stock)
  const standardRows = [];
  
  // Brand
  standardRows.push({
    key: 'brand',
    label: t('brand'),
    get: (p) => p.brand || '—',
    numeric: false,
  });

  // Price (always second, and lower is better)
  standardRows.push({
    key: 'price',
    label: 'Price',
    get: (p) => p.discountPrice || p.price,
    numeric: true,
    format: (v) => v ? `${Math.round(v).toLocaleString()} UZS` : '—',
  });

  // Unit / Sold By
  standardRows.push({
    key: 'unit',
    label: 'Sold By',
    get: (p) => (p.unit === 'meters' ? t('per_meter') : t('per_piece')),
    numeric: false,
  });

  // Stock
  standardRows.push({
    key: 'stock',
    label: 'Stock',
    get: (p) => p.stock,
    numeric: true,
    format: (v) => v !== null && v !== undefined ? `${v} units` : '—',
  });

  // Dynamic characteristics from products
  const characteristicRows = Array.from(allCharacteristicNames)
    .sort()
    .map((name) => {
      // Determine if this characteristic contains numeric values
      const values = items.map((p) => (p.specifications && p.specifications[name]) || null);
      const numericValues = values.map((v) => v !== null && v !== undefined ? parseNumericValue(v) : NaN).filter((v) => !isNaN(v));
      const isNumericCharacteristic = numericValues.length > 0 && numericValues.length === values.filter((v) => v !== null && v !== undefined).length;

      return {
        key: `spec_${name}`,
        label: name,
        get: (p) => (p.specifications && p.specifications[name]) || null,
        numeric: isNumericCharacteristic,
        format: (v) => (v !== null && v !== undefined ? String(v) : '—'),
      };
    });

  return [...standardRows, ...characteristicRows];
}

export default function ComparePage() {
  const { t } = useTranslation();
  const items = useCompareStore((s) => s.items);
  const removeItem = useCompareStore((s) => s.removeItem);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <GitCompare size={40} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-charcoal mb-2">{t('compare_empty')}</h1>
        <p className="text-sm text-slate-400 mb-6">{t('compare_empty_sub')}</p>
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

  const rows = generateDynamicRows(items, t);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal mb-1">{t('compare_products_title')}</h1>
          <p className="text-sm text-slate-400">{items.length} of 4 products</p>
        </div>
        <button type="button" onClick={clearCompare} className="text-xs font-semibold text-slate-400 hover:text-heat">
          {t('clear_all')}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="w-40 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 align-bottom sticky left-0 bg-white z-10">
                {t('specification')}
              </th>
              {items.map((product) => (
                <th key={product.sku} className="px-4 py-4 text-left align-top min-w-[280px]">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-semibold text-charcoal hover:text-heat transition-colors line-clamp-2"
                    >
                      {product.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(product.sku)}
                      className="shrink-0 text-slate-300 hover:text-heat flex-shrink-0"
                      aria-label="Remove from compare"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <ProductThumb product={product} className="h-48 w-full rounded-xl mb-4 object-contain" />
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-1.5 bg-charcoal text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-charcoal/90 transition-colors"
                  >
                    <ShoppingCart size={13} /> {t('add_to_cart')}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = items.map((p) => row.get(p));
              
              let numericValues = [];
              let parsedNumericValues = [];
              
              if (row.numeric) {
                values.forEach((v) => {
                  if (v !== null && v !== undefined) {
                    const parsed = parseNumericValue(v);
                    if (!isNaN(parsed)) {
                      numericValues.push(v);
                      parsedNumericValues.push(parsed);
                    }
                  }
                });
              }

              const best = parsedNumericValues.length > 1 
                ? (HIGHER_IS_BETTER[row.key] === false 
                  ? Math.min(...parsedNumericValues) 
                  : Math.max(...parsedNumericValues)) 
                : null;
                
              const worst = parsedNumericValues.length > 1 
                ? (HIGHER_IS_BETTER[row.key] === false 
                  ? Math.max(...parsedNumericValues) 
                  : Math.min(...parsedNumericValues)) 
                : null;

              return (
                <tr key={row.key} className="border-t border-slate-50">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50/60">{row.label}</td>
                  {items.map((product, i) => {
                    const value = values[i];
                    const display = value === null || value === undefined ? '—' : row.format ? row.format(value) : value;
                    let tone = '';
                    if (row.numeric && parsedNumericValues.length > 1 && value !== null && value !== undefined) {
                      const parsedValue = parseNumericValue(value);
                      if (!isNaN(parsedValue)) {
                        if (parsedValue === best && best !== worst) tone = 'text-emerald-600 font-semibold bg-emerald-50';
                        else if (parsedValue === worst && best !== worst) tone = 'text-heat font-semibold bg-heat/5';
                      }
                    }
                    return (
                      <td key={product.sku} className={`px-4 py-3 rounded-lg ${tone}`}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
