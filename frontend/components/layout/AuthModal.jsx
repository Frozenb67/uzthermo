'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rendered into document.body via a portal (below) rather than in place. Any
  // ancestor with backdrop-filter/transform/etc creates a "containing block"
  // that traps position:fixed descendants inside its own small box instead of
  // the viewport — that's what put this modal behind the rest of the page
  // (Header's backdrop-blur was the culprit). Portaling to <body> sidesteps
  // that entirely, permanently, regardless of where this component is used.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        // The OUTER layer scrolls, not just the card — on short viewports or with
        // the mobile keyboard open, this guarantees every part of the form (header,
        // fields, submit button) can be scrolled into view. A fixed-height/overflow
        // rule on the card alone isn't enough when the visual viewport shrinks.
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
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
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-charcoal"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-heat/10 text-heat flex items-center justify-center">
                <User size={18} />
              </div>
              <h2 className="text-lg font-bold text-charcoal">
                {mode === 'login' ? t('sign_in') : t('create_account')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {mode === 'login' ? t('access_orders_sub') : t('save_details_sub')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <input
                    required
                    placeholder={t('full_name')}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                  <input
                    placeholder={t('phone_number')}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                </>
              )}
              <input
                required
                type="email"
                placeholder={t('email')}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
              />
              <input
                required
                type="password"
                placeholder={t('password')}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
              />

              {error && <p className="text-xs text-heat">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-charcoal text-white text-sm font-semibold py-3 rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {mode === 'login' ? t('sign_in') : t('create_account')}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
              className="w-full text-center text-xs text-slate-500 hover:text-heat mt-4"
            >
              {mode === 'login' ? t('no_account') : t('have_account')}
            </button>
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
