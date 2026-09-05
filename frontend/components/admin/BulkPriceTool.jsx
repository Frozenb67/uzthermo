'use client';

import { useState } from 'react';
import { Percent, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function BulkPriceTool({ categories, onApplied }) {
  const token = useAuthStore((s) => s.token);
  const [category, setCategory] = useState('');
  const [percent, setPercent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function handleApply(e) {
    e.preventDefault();
    setError('');
    setResult('');

    if (!percent) {
      setError('Enter a percentage, e.g. 5 or -10');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/products/bulk-price', {
        method: 'PATCH',
        body: { category: category || undefined, percent: Number(percent) },
        token,
      });
      setResult(`Updated ${data.updated} product${data.updated !== 1 ? 's' : ''}`);
      setPercent('');
      onApplied?.();
    } catch (err) {
      setError(err.message || 'Could not apply bulk price update');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-center gap-2 text-amber-600 mb-1">
        <Percent size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">Bulk Price Multiplier</span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        E.g. +5% ahead of a seasonal price rise, or -10% for a flash sale — applies to
        <code className="mx-1 bg-slate-100 px-1 rounded">price</code> and
        <code className="mx-1 bg-slate-100 px-1 rounded">discountPrice</code> together.
      </p>

      <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-heat/30"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Percent change</label>
          <input
            type="number"
            placeholder="e.g. 5 or -10"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-36 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-heat/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-charcoal text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-charcoal/90 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Percent size={14} />}
          Apply
        </button>
        {result && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} /> {result}
          </span>
        )}
        {error && <span className="text-xs text-heat">{error}</span>}
      </form>
    </div>
  );
}
