'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';
import { useTranslation } from '../lib/i18n/useTranslation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

/**
 * Self-contained checkout trigger + modal. Defaults to the current cart
 * (useCartStore) but can be pointed at a single item for a "Buy Now" flow
 * via the `items` prop. On submit, POSTs to /api/orders — the backend then
 * fires the Telegram bot notification (see services/telegramBot.js), so
 * nothing Telegram-related happens client-side beyond sharing GPS coordinates.
 */
export default function CheckoutModal({
  items: itemsProp,
  triggerLabel,
  className = '',
}) {
  const { t } = useTranslation();
  const PAYMENT_OPTIONS = [
    { value: 'cash', label: t('cash_on_delivery'), icon: Banknote },
    { value: 'click', label: 'Click', icon: Smartphone },
    { value: 'payme', label: 'Payme', icon: CreditCard },
  ];
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const items = itemsProp || cartItems;
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    paymentMethod: 'cash',
    address: '',
  });

  const [location, setLocation] = useState(null); // { lat, lng }
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | success | error

  // Portaled to document.body below — an ancestor with backdrop-filter/transform
  // would otherwise trap this fixed-position modal inside its own small box
  // instead of the full viewport (that's what put it "behind everything").
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus('success');
      },
      () => {
        setGeoStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function close() {
    setOpen(false);
    setStatus('idle');
    setErrorMessage('');
    setOrderId(null);
    setForm({ name: '', phone: '', paymentMethod: 'cash', address: '' });
    setLocation(null);
    setGeoStatus('idle');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMessage('Please enter your name and phone number.');
      return;
    }
    if (!form.address.trim() && !location) {
      setErrorMessage('Enter a delivery address or share your current location.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setStatus('submitting');

    const payload = {
      guest: { name: form.name, phone: form.phone },
      items: items.map((i) => ({
        // Only a real Mongo _id is valid here — our demo catalog has none, and the
        // backend casts this to ObjectId, so a SKU string would fail validation.
        product: i.productId || null,
        title: i.title,
        sku: i.sku,
        qty: i.qty,
        selectedUnit: i.selectedUnit || 'pcs',
        selectedVariant: i.selectedVariant || null,
        unitPrice: i.price,
      })),
      totalPrice: total,
      currency: 'UZS',
      paymentMethod: form.paymentMethod,
      deliveryAddress: { raw: form.address },
      deliveryLocation: location || undefined,
    };

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Could not place order');
      }

      setOrderId(data._id);
      setStatus('done');
      if (!itemsProp) clearCart();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Network error — please try again.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={items.length === 0}
        className={`inline-flex items-center justify-center gap-2 bg-heat text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-heat/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <ShoppingBag size={16} />
        {triggerLabel || t('proceed_checkout')}
      </button>

      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] overflow-y-auto">
            <motion.button
              type="button"
              aria-label="Close"
              className="fixed inset-0 bg-black/50"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <div className="relative min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 my-8"
            >
              <button
                type="button"
                onClick={close}
                className="absolute top-4 right-4 text-slate-400 hover:text-charcoal"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {status === 'done' ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
                  <h3 className="text-lg font-bold text-charcoal mb-1">{t('order_placed')}</h3>
                  <p className="text-sm text-slate-500 mb-1">
                    Order <strong>#{String(orderId).slice(-6).toUpperCase()}</strong> was sent to our
                    manager on Telegram.
                  </p>
                  <p className="text-xs text-slate-400 mb-5">{t('order_placed_sub')}</p>
                  <button
                    type="button"
                    onClick={close}
                    className="text-sm font-semibold text-heat hover:underline"
                  >
                    {t('close')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-full bg-heat/10 text-heat flex items-center justify-center">
                      <ShoppingBag size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-charcoal">{t('checkout')}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {items.length} item{items.length !== 1 ? 's' : ''} · {formatCurrency(total)}
                  </p>

                  {/* Order summary */}
                  <div className="rounded-xl bg-slate-50 divide-y divide-slate-100 mb-5 max-h-32 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.sku} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                        <span className="truncate text-charcoal">{item.title} × {item.qty}</span>
                        <span className="font-semibold text-charcoal shrink-0">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      required
                      placeholder={t('full_name')}
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                    />
                    <input
                      required
                      type="tel"
                      placeholder={t('phone_number')}
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                    />

                    <div>
                      <textarea
                        placeholder={t('delivery_address')}
                        rows={2}
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30 resize-none"
                      />
                      <button
                        type="button"
                        onClick={shareLocation}
                        disabled={geoStatus === 'locating'}
                        className={`mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl border transition-colors ${
                          geoStatus === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 text-slate-600 hover:border-heat hover:text-heat'
                        }`}
                      >
                        {geoStatus === 'locating' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <MapPin size={14} />
                        )}
                        {geoStatus === 'success'
                          ? t('location_shared')
                          : geoStatus === 'error'
                          ? t('location_error')
                          : t('share_location')}
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">{t('payment_method')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update('paymentMethod', value)}
                            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[11px] font-medium transition-colors ${
                              form.paymentMethod === value
                                ? 'border-heat bg-heat/5 text-heat'
                                : 'border-slate-200 text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            <Icon size={16} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-500">{t('total')}</span>
                      <span className="text-base font-bold text-charcoal">{formatCurrency(total)}</span>
                    </div>

                    {errorMessage && <p className="text-xs text-heat">{errorMessage}</p>}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 bg-charcoal text-white text-sm font-semibold py-3 rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-60"
                    >
                      {status === 'submitting' && <Loader2 size={15} className="animate-spin" />}
                      {t('place_order')}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
