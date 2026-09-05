'use client';

import { Suspense } from 'react';
import CatalogView from '../../components/catalog/CatalogView';

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center text-sm text-slate-400">
          Loading catalog…
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}
