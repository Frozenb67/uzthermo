'use client';

import { useEffect, useState } from 'react';
import { Wrench, Star, MapPin } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export default function InstallersPage() {
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/installers`)
      .then((res) => res.json())
      .then((data) => setInstallers(Array.isArray(data) ? data : []))
      .catch(() => setInstallers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-heat mb-2">
        <Wrench size={20} />
        <span className="text-xs font-semibold uppercase tracking-wide">Professional Installers</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-6">
        Verified HVAC Engineers &amp; Plumbers
      </h1>

      {loading ? (
        <p className="text-sm text-slate-400">Loading installers…</p>
      ) : installers.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-400 mb-1">No installers listed yet.</p>
          <p className="text-xs text-slate-400">
            Need a boiler mounted or pipes laid? Call our hotline and we&apos;ll arrange a visit directly.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {installers.map((inst) => (
            <div key={inst._id} className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="w-12 h-12 rounded-full bg-slate-100 mb-3" />
              <p className="text-sm font-semibold text-charcoal">{inst.name}</p>
              <p className="text-xs text-slate-400 mb-2 capitalize">{(inst.specialization || []).join(', ')}</p>
              <div className="flex items-center gap-1 text-xs text-amber-500 mb-1">
                <Star size={12} fill="currentColor" /> {inst.rating?.toFixed?.(1) || '—'}
                <span className="text-slate-400 ml-1">({inst.completedProjects || 0} projects)</span>
              </div>
              {inst.serviceRegions?.length > 0 && (
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} /> {inst.serviceRegions.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
