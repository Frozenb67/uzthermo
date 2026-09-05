'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { PRODUCTS } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';
import { useTranslation } from '../../lib/i18n/useTranslation';

// Filters against SKU, title, brand, and any diameter/kW value found in specifications.
function matchesQuery(product, query) {
  const q = query.toLowerCase();
  const specsText = Object.values(product.specifications || {}).join(' ').toLowerCase();
  return (
    product.title.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q) ||
    product.brand.toLowerCase().includes(q) ||
    specsText.includes(q)
  );
}

export default function SearchAutocomplete() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return PRODUCTS.filter((p) => matchesQuery(p, query)).slice(0, 6);
  }, [query]);

  function goToCatalog() {
    if (!query.trim()) return;
    router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    setFocused(false);
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-heat/40">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && goToCatalog()}
          placeholder={t('search_placeholder')}
          className="bg-transparent text-sm w-full outline-none placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            <X size={15} className="text-slate-400 hover:text-charcoal" />
          </button>
        )}
      </div>

      {focused && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          {results.map((product) => (
            <button
              key={product.sku}
              type="button"
              onMouseDown={() => router.push(`/product/${product.slug}`)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{product.title}</p>
                <p className="text-xs text-slate-400">{product.brand} · SKU {product.sku}</p>
              </div>
              <span className="text-sm font-semibold text-heat shrink-0">
                {formatCurrency(product.discountPrice || product.price)}
              </span>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={goToCatalog}
            className="w-full text-center py-2.5 text-xs font-semibold text-heat hover:bg-heat/5 transition-colors"
          >
            View all results in catalog →
          </button>
        </div>
      )}
    </div>
  );
}
