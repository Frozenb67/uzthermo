'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PRODUCTS } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { getProductImageUrl, tryFetchLiveProductBySlug } from '../../../lib/api';
import { useCartStore } from '../../../store/useCartStore';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(() => PRODUCTS.find((item) => item.slug === slug) || null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let cancelled = false;
    tryFetchLiveProductBySlug(slug).then((liveProduct) => {
      if (!cancelled && liveProduct) setProduct(liveProduct);
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const availableVariants = useMemo(
    () => variants.filter((variant) => variant.stock === undefined || variant.stock > 0),
    [variants]
  );
  const selectedVariant = useMemo(() => {
    const requested = availableVariants.find((variant) => variant.size === selectedSize);
    return requested || availableVariants[0] || null;
  }, [availableVariants, selectedSize]);
  const price = selectedVariant?.price ?? product?.discountPrice ?? product?.price ?? 0;
  const image = product ? getProductImageUrl(product) : null;
  const unavailable = !product || product.stock === 0 || (variants.length > 0 && !selectedVariant);

  function handleAddToCart() {
    if (unavailable) return;
    addItem(product, quantity, product.unit || 'pcs', selectedVariant);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  if (loading && !product) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-400">Loading product details...</div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><p className="text-slate-500">Product not found.</p><Link href="/catalog" className="text-heat font-semibold">Back to catalog</Link></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/60 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400"><Link href="/catalog" className="hover:text-heat">Catalog</Link><span className="mx-2">/</span>{product.title}</nav>
        <section className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl bg-slate-100 p-8">
            {image ? <img src={image} alt={product.title} className="max-h-[460px] w-full object-contain" /> : <span className="text-sm text-slate-400">Product image unavailable</span>}
          </div>
          <div className="flex flex-col">
            <p className="mb-2 text-sm font-medium text-heat">{product.brand || 'UzThermo'}</p>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-charcoal">{product.title}</h1>
            <p className="mb-6 text-sm leading-7 text-slate-600">{product.description || 'Reliable heating and plumbing equipment for your home and business.'}</p>
            {variants.length > 0 && <div className="mb-6"><p className="mb-2 text-sm font-semibold text-slate-700">Select size / volume</p><div className="flex flex-wrap gap-2">{variants.map((variant) => { const inStock = variant.stock === undefined || variant.stock > 0; return <button key={variant.size} type="button" disabled={!inStock} onClick={() => setSelectedSize(variant.size)} className={`rounded-xl border-2 px-4 py-2 text-sm ${selectedVariant?.size === variant.size ? 'border-heat bg-heat/5 text-heat' : 'border-slate-200 text-slate-600'} ${!inStock ? 'cursor-not-allowed opacity-40' : ''}`}>{variant.size}</button>; })}</div></div>}
            <div className="mb-6 text-3xl font-extrabold text-heat">{formatCurrency(price)}</div>
            <div className="mt-auto flex gap-3">
              <div className="flex items-center rounded-full border border-slate-200"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-12 w-10 text-lg">-</button><span className="w-8 text-center font-semibold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-12 w-10 text-lg">+</button></div>
              <button type="button" disabled={unavailable} onClick={handleAddToCart} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 font-semibold text-white transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40">{added ? <><CheckCircle2 size={18} /> Added</> : <><ShoppingCart size={18} /> Add to cart</>}</button>
            </div>
          </div>
        </section>

        {/* Characteristics Section */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:p-10">
            <h2 className="mb-6 text-xl font-bold text-charcoal">Characteristics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(product.specifications).map(([name, value]) => (
                <div key={name} className="flex flex-col rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{name}</p>
                  <p className="text-sm font-semibold text-charcoal">{String(value)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
