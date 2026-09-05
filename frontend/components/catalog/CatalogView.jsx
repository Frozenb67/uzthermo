'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Search } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import ProductGrid from './ProductGrid';
import ProductTableView from './ProductTableView';
import { PRODUCTS, CATEGORIES } from '../../lib/mockData';
import { tryFetchLiveProducts } from '../../lib/api';
import { useTranslation } from '../../lib/i18n/useTranslation';

function parseList(value) {
  return value ? value.split(',').filter(Boolean) : [];
}

export default function CatalogView() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Renders from the bundled demo catalog first (matches SSR exactly, so no
  // hydration mismatch), then swaps in real admin-managed products once the
  // backend responds — same pattern as the persisted Zustand stores.
  const [allProducts, setAllProducts] = useState(PRODUCTS);
  useEffect(() => {
    tryFetchLiveProducts().then((live) => {
      if (live) setAllProducts(live);
    });
  }, []);

  const filters = {
    category: searchParams.get('category') || '',
    brand: parseList(searchParams.get('brand')),
    diameter: parseList(searchParams.get('diameter')),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    minKW: searchParams.get('minKW') ? Number(searchParams.get('minKW')) : null,
    maxKW: searchParams.get('maxKW') ? Number(searchParams.get('maxKW')) : null,
    inStock: searchParams.get('inStock') === 'true',
  };
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const view = searchParams.get('view') || 'grid';

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      const isEmpty = value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        params.delete(key);
      } else {
        params.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    router.push(`/catalog?${params.toString()}`, { scroll: false });
  }

  function resetFilters() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    router.push(`/catalog?${params.toString()}`, { scroll: false });
  }

  const options = useMemo(() => {
    const brands = [...new Set(allProducts.map((p) => p.brand))].sort();
    const diameters = [...new Set(allProducts.map((p) => p.specifications?.diameter).filter(Boolean))].sort();
    const prices = allProducts.map((p) => p.discountPrice || p.price);
    return {
      brands,
      diameters,
      priceBounds: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (filters.category) list = list.filter((p) => p.category === filters.category);
    if (filters.brand.length) list = list.filter((p) => filters.brand.includes(p.brand));
    if (filters.diameter.length) {
      list = list.filter((p) => filters.diameter.includes(p.specifications?.diameter));
    }
    if (filters.minPrice) list = list.filter((p) => (p.discountPrice || p.price) >= filters.minPrice);
    if (filters.maxPrice) list = list.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice);
    if (filters.minKW) list = list.filter((p) => (p.specifications?.powerKW || 0) >= filters.minKW);
    if (filters.maxKW) list = list.filter((p) => (p.specifications?.powerKW || 0) <= filters.maxKW);
    if (filters.inStock) list = list.filter((p) => p.stock > 0);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }

    return list;
  }, [allProducts, filters, search, sort]);

  const categoryLabel = CATEGORIES.find((c) => c.slug === filters.category)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal mb-1">
          {categoryLabel || t('all_categories')}
        </h1>
        <p className="text-sm text-slate-400">{filtered.length} {t('products_found')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar filters={filters} options={options} onChange={(key, value) => updateParams({ [key]: value })} onReset={resetFilters} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5 flex-1">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                defaultValue={search}
                onChange={(e) => updateParams({ search: e.target.value })}
                placeholder={t('search_within_results')}
                className="bg-transparent text-sm w-full outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-heat/30"
            >
              <option value="newest">{t('newest')}</option>
              <option value="price-asc">{t('price_low_high')}</option>
              <option value="price-desc">{t('price_high_low')}</option>
            </select>

            <div className="inline-flex rounded-full bg-slate-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => updateParams({ view: null })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                  view === 'grid' ? 'bg-white text-charcoal shadow-sm' : 'text-slate-500'
                }`}
              >
                <LayoutGrid size={14} /> {t('grid')}
              </button>
              <button
                type="button"
                onClick={() => updateParams({ view: 'table' })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                  view === 'table' ? 'bg-white text-charcoal shadow-sm' : 'text-slate-500'
                }`}
              >
                <List size={14} /> {t('table')}
              </button>
            </div>
          </div>

          {view === 'table' ? <ProductTableView products={filtered} /> : <ProductGrid products={filtered} />}
        </div>
      </div>
    </div>
  );
}
