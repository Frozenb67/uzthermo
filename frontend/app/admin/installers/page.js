'use client';

import { Wrench } from 'lucide-react';

export default function AdminInstallersPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-heat mb-1">
        <Wrench size={18} />
        <span className="text-xs font-semibold uppercase tracking-wide">Installer Requests</span>
      </div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">Installers</h1>
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-sm text-slate-400">
          Contractor booking request management is coming next — it will list requests
          submitted from the /installers page with status controls.
        </p>
      </div>
    </div>
  );
}
