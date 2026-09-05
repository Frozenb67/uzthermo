'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useTranslation } from '../lib/i18n/useTranslation';

const STORE_TELEGRAM_HANDLE = 'uztherrmo_bot';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

function buildTelegramMessage({ product, selectedVariant, name, phone, qty, currency = 'UZS', displayUnitPrice, displayTotal }) {
  const unitPrice = selectedVariant?.price ?? product.discountPrice ?? product.price;
  const lines = [
    '🔥 New 1-Click Order — UzThermo',
    '',
    `Product: ${product.title}`,
    `SKU: ${product.sku}`,
    ...(selectedVariant ? [`Size: ${selectedVariant.size}`] : []),
    `Price: ${displayUnitPrice ?? formatCurrency(unitPrice)} ${currency} x ${qty}`,
    `Total: ${displayTotal ?? formatCurrency(unitPrice * qty)} ${currency}`,
    '',
    `Customer: ${name}`,
    `Phone: ${phone}`,
  ];
  return lines.join('\n');
}

/**
 * Self-contained "1-Click Telegram Order" trigger + modal.
 * Drop <TelegramOrderModal product={product} /> into a product card or PDP —
 * it renders its own button and manages its own open state.
 */
export default function TelegramOrderModal({ product, selectedVariant = null, className = '', label, currency = 'UZS', currencyRate = 1 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', qty: 1 });
  const [status, setStatus] = useState('idle'); // idle | submitting | done
  const [error, setError] = useState('');

  // Portaled to document.body below — an ancestor with backdrop-filter/transform
  // would otherwise trap this fixed-position modal inside its own small box
  // instead of the full viewport (that's what put it "behind everything").
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const unitPrice = selectedVariant?.price ?? product.discountPrice ?? product.price;
  const total = unitPrice * form.qty;
  const displayUnitPrice = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(unitPrice * currencyRate);
  const displayTotal = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(total * currencyRate);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }

    setStatus('submitting');

    const message = buildTelegramMessage({ product, selectedVariant, ...form, currency, displayUnitPrice, displayTotal });
    const telegramUrl = `https://t.me/${STORE_TELEGRAM_HANDLE}?text=${encodeURIComponent(message)}`;

    // Best-effort order record — the Telegram handoff below is the source of truth,
    // so a failed/offline backend must never block checkout.
    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: { name: form.name, phone: form.phone },
          items: [
            {
              // Only a real Mongo _id is valid here — our demo catalog has none, and
              // the backend casts this to ObjectId, so a SKU string would fail validation.
              product: product._id || null,
              title: product.title,
              sku: product.sku,
              qty: Number(form.qty),
              selectedUnit: product.unit || 'pcs',
              selectedVariant: selectedVariant || null,
              unitPrice,
            },
          ],
          totalPrice: total,
          paymentMethod: 'cash',
        }),
      });
    } catch {
      // Ignore — backend may not be running in this environment.
    }

    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    setStatus('done');
  }

  function close() {
    setOpen(false);
    setStatus('idle');
    setForm({ name: '', phone: '', qty: 1 });
    setError('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-sky-600 transition-colors ${className}`}
      >
        <Zap size={15} />
        {label || t('one_click_order')}
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
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 my-8"
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
                  <h3 className="text-lg font-bold text-charcoal mb-1">{t('order_sent')}</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    We opened Telegram with your order details — send the message to confirm with
                    our manager.
                  </p>
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
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center">
                      <Send size={16} />
                    </div>
                    <h2 className="text-lg font-bold text-charcoal">{t('quick_telegram_order')}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 truncate" title={product.title}>
                    {product.title} · SKU {product.sku}
                  </p>

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
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="qty" className="text-sm text-slate-600 shrink-0">
                        {t('quantity')}
                      </label>
                      <input
                        id="qty"
                        type="number"
                        min={1}
                        value={form.qty}
                        onChange={(e) => update('qty', Math.max(1, Number(e.target.value)))}
                        className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-heat/30"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-500">{t('total')}</span>
                      <span className="text-base font-bold text-charcoal">{displayTotal} {currency}</span>
                    </div>

                    {error && <p className="text-xs text-heat">{error}</p>}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white text-sm font-semibold py-3 rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-60"
                    >
                      {status === 'submitting' ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      {t('send_via_telegram')}
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
