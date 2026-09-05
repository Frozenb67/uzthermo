'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../../lib/mockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function FilterSidebar({ filters, options, onChange, onReset }) {
  const { t } = useTranslation();
  const { category, brand, diameter, minPrice, maxPrice, minKW, maxKW, inStock } = filters;
  const { brands, diameters, priceBounds } = options;

  function toggleInArray(key, value, current) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(key, next);
  }

  const hasActiveFilters =
    category || brand.length || diameter.length || minPrice || maxPrice || minKW || maxKW || inStock;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
          <SlidersHorizontal size={16} className="text-heat" />
          {t('filters')}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-heat"
          >
            <X size={12} /> {t('clear_all')}
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{t('category_label')}</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onChange('category', '')}
            className={`block w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
              !category ? 'bg-heat/10 text-heat font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t('all_categories')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onChange('category', cat.slug)}
              className={`block w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                category === cat.slug ? 'bg-heat/10 text-heat font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          {t('price_range')}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={String(priceBounds.min)}
            value={minPrice || ''}
            onChange={(e) => onChange('minPrice', e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-heat/30"
          />
          <span className="text-slate-300">–</span>
          <input
            type="number"
            placeholder={String(priceBounds.max)}
            value={maxPrice || ''}
            onChange={(e) => onChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-heat/30"
          />
        </div>
      </div>

      {/* Power output */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          {t('power_output')}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minKW || ''}
            onChange={(e) => onChange('minKW', e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-heat/30"
          />
          <span className="text-slate-300">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxKW || ''}
            onChange={(e) => onChange('maxKW', e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-heat/30"
          />
        </div>
      </div>

      {/* Pipe diameter */}
      {diameters.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            {t('pipe_diameter')}
          </p>
          <div className="flex flex-wrap gap-2">
            {diameters.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleInArray('diameter', d, diameter)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  diameter.includes(d)
                    ? 'border-heat bg-heat text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{t('brand')}</p>
        <div className="space-y-2">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={brand.includes(b)}
                onChange={() => toggleInArray('brand', b, brand)}
                className="accent-heat"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      {/* Stock */}
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => onChange('inStock', e.target.checked)}
          className="accent-heat"
        />
        {t('in_stock_only')}
      </label>
    </aside>
  );
}
