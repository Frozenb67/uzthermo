'use client';

import { Image as ImageIcon } from 'lucide-react';

export default function AdminBannersPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-heat mb-1">
        <ImageIcon size={18} />
        <span className="text-xs font-semibold uppercase tracking-wide">Homepage Configurator</span>
      </div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">Banners &amp; Deals</h1>
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-sm text-slate-400">
          Managing the hero slider, video review links, and featured hot deals from here
          is coming next.
        </p>
      </div>
    </div>
  );
}
