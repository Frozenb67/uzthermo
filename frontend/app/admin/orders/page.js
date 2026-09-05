'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Send, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiFetch } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';

const STATUS_OPTIONS = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  processing: 'bg-sky-50 text-sky-600 border-sky-200',
  dispatched: 'bg-violet-50 text-violet-600 border-violet-200',
  delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const PAYMENT_LABELS = {
  cash: 'Cash on Delivery',
  card: 'Card',
  click: 'Click',
  payme: 'Payme',
  bank_transfer: 'Bank Transfer',
};

function googleMapsUrl(order) {
  if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`;
  }
  const address = order.deliveryAddress?.raw;
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return null;
}

function OrderCard({ order, token, onStatusChanged }) {
  const [updating, setUpdating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  const customerName = order.user?.name || order.guest?.name || 'Unknown';
  const customerPhone = order.user?.phone || order.guest?.phone || 'N/A';
  const mapsUrl = googleMapsUrl(order);
  const hasCoords = Boolean(order.deliveryLocation?.lat && order.deliveryLocation?.lng);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      await apiFetch(`/api/orders/${order._id}/status`, { method: 'PATCH', body: { status }, token });
      onStatusChanged(order._id, status);
    } catch (err) {
      alert(err.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleNotify() {
    setNotifying(true);
    setNotifyMessage('');
    try {
      await apiFetch(`/api/orders/${order._id}/notify`, { method: 'POST', token });
      setNotifyMessage('Sent ✓');
    } catch (err) {
      setNotifyMessage(err.message || 'Failed');
    } finally {
      setNotifying(false);
      setTimeout(() => setNotifyMessage(''), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-bold text-charcoal">
            Order #{String(order._id).slice(-6).toUpperCase()}
          </p>
          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs font-semibold rounded-full border px-3 py-1.5 outline-none capitalize ${STATUS_STYLES[order.status]}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {updating && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Customer */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Customer</p>
          <p className="text-sm font-medium text-charcoal">{customerName}</p>
          <a href={`tel:${customerPhone}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-heat mt-0.5">
            <Phone size={13} /> {customerPhone}
          </a>
          <p className="text-xs text-slate-400 mt-2">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>

        {/* Location — the operationally critical field */}
        <div className={`rounded-xl p-3 border ${hasCoords ? 'bg-heat/5 border-heat/20' : 'bg-slate-50 border-transparent'}`}>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-heat mb-1.5">
            <MapPin size={13} /> Delivery Location
          </p>
          {order.deliveryAddress?.raw && (
            <p className="text-sm text-charcoal mb-1">{order.deliveryAddress.raw}</p>
          )}
          {hasCoords && (
            <p className="text-xs font-mono text-slate-500 mb-1.5">
              {order.deliveryLocation.lat.toFixed(5)}, {order.deliveryLocation.lng.toFixed(5)}
            </p>
          )}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-heat hover:underline"
            >
              Open in Google Maps <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-xs text-slate-400">No address or GPS location provided</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-slate-100 divide-y divide-slate-50 mb-4">
        {order.items.map((item) => (
          <div key={item.sku} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-charcoal truncate">{item.title} <span className="text-slate-400">× {item.qty}</span></span>
            <span className="font-semibold text-charcoal shrink-0 ml-3">
              {formatCurrency(item.unitPrice * item.qty, order.currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-charcoal">
          Total: {formatCurrency(order.totalPrice, order.currency)}
        </p>
        <button
          type="button"
          onClick={handleNotify}
          disabled={notifying}
          className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline disabled:opacity-50"
        >
          {notifying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          {notifyMessage || 'Notify customer on Telegram'}
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiFetch(`/api/orders${query}`, { token });
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function handleStatusChanged(orderId, status) {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Orders</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-heat/30"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadOrders}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-heat hover:border-heat transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-heat/5 border border-heat/20 text-heat text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-400">No orders yet — they'll appear here the moment a customer checks out.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} token={token} onStatusChanged={handleStatusChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
