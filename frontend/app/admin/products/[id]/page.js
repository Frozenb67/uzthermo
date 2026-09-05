'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function AdminProductEditPage() {
  const { id } = useParams();

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-heat mb-6">
        <ArrowLeft size={14} /> Back to Products
      </Link>
      <h1 className="text-xl font-bold text-charcoal mb-2">Edit Product</h1>
      <p className="text-sm text-slate-400">
        The product edit form (dynamic spec key/value editor, images, documents) for
        <span className="font-mono"> {id} </span> is coming next.
      </p>
    </div>
  );
}
