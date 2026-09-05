'use client';

import { getProductImageUrl } from '../lib/api';

/**
 * Renders a product's uploaded image when one exists (resolved to the
 * backend origin), otherwise the same gray placeholder box used everywhere
 * before image upload existed. Drop-in replacement for a plain
 * `<div className="... bg-slate-100" />`.
 */
export default function ProductThumb({ product, className = '' }) {
  const url = getProductImageUrl(product);

  if (!url) {
    return <div className={`bg-slate-100 ${className}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={product?.title || ''} className={`object-cover ${className}`} />
  );
}
