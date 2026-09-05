'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, PackageX, ShoppingBag, ArrowRight, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

function StatCard({ icon: Icon, label, value, tone = 'text-charcoal' }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function TelegramSettingsCard({ token }) {
  const [chatId, setChatId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [tokenSet, setTokenSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/settings', { token })
      .then((data) => {
        if (cancelled) return;
        setChatId(data.telegramChatId || '');
        setTokenSet(data.telegramBotTokenSet);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const body = { telegramChatId: chatId };
      if (botToken.trim()) body.telegramBotToken = botToken.trim();
      const data = await apiFetch('/api/settings', { method: 'PUT', body, token });
      setTokenSet(data.telegramBotTokenSet);
      setBotToken('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 mt-6">
      <div className="flex items-center gap-2 text-sky-600 mb-1">
        <Send size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">Telegram Bot Configuration</span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Controls where new-order alerts (and customer location) get sent. Changes apply within a minute.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="chatId">
              Manager Chat ID
            </label>
            <input
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 5575302424"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-heat/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="botToken">
              Bot Token {tokenSet && <span className="text-emerald-600">(currently set)</span>}
            </label>
            <input
              id="botToken"
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder={tokenSet ? '••••••••••• (leave blank to keep)' : 'Paste bot token from @BotFather'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-heat/30"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-charcoal text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-charcoal/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Save
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
            {error && <span className="text-xs text-heat">{error}</span>}
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const [trends, setTrends] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [trendsData, lowStockData, topSellersData] = await Promise.all([
          apiFetch('/api/admin/analytics/sales-trends', { token }),
          apiFetch('/api/admin/analytics/low-stock', { token }),
          apiFetch('/api/admin/analytics/top-sellers', { token }),
        ]);
        if (cancelled) return;
        setTrends(trendsData);
        setLowStock(lowStockData);
        setTopSellers(topSellersData);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
  const totalOrders = trends.reduce((sum, t) => sum + t.orders, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal mb-1">Dashboard</h1>
          <p className="text-sm text-slate-400">Last 30 days</p>
        </div>
        <Link href="/admin/orders" className="text-sm font-semibold text-heat hover:underline flex items-center gap-1">
          View all orders <ArrowRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-heat/5 border border-heat/20 text-heat text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Revenue (30d)" value={loading ? '—' : formatCurrency(totalRevenue)} />
        <StatCard icon={ShoppingBag} label="Orders (30d)" value={loading ? '—' : totalOrders} />
        <StatCard
          icon={PackageX}
          label="Low Stock Items"
          value={loading ? '—' : lowStock.length}
          tone={lowStock.length > 0 ? 'text-heat' : 'text-charcoal'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-charcoal mb-4">Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">{loading ? 'Loading…' : 'Nothing low on stock right now.'}</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal truncate">{p.title}</span>
                  <span className="text-heat font-semibold shrink-0 ml-3">
                    {p.stock} {p.unit} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-charcoal mb-4">Top Sellers</h2>
          {topSellers.length === 0 ? (
            <p className="text-sm text-slate-400">{loading ? 'Loading…' : 'No sales recorded yet.'}</p>
          ) : (
            <div className="space-y-2">
              {topSellers.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal truncate">{p.title}</span>
                  <span className="text-slate-500 shrink-0 ml-3">{p.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TelegramSettingsCard token={token} />
    </div>
  );
}
