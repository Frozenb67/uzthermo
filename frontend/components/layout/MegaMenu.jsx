'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../../lib/mockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function MegaMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeTimer = useRef(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const active = CATEGORIES[activeIndex];

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className="flex items-center gap-2 font-semibold text-sm text-charcoal hover:text-heat transition-colors py-2"
      >
        <LayoutGrid size={18} />
        {t('catalog_of_systems')}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-[640px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-[220px_1fr] z-50"
          >
            <div className="bg-slate-50 py-2">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.slug}
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    i === activeIndex ? 'bg-white text-heat' : 'text-charcoal/80 hover:text-heat'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                {active.name}
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {active.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link
                      href={`/catalog?category=${active.slug}`}
                      className="block px-3 py-2 rounded-lg text-sm text-charcoal hover:bg-heat/5 hover:text-heat transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/catalog?category=${active.slug}`}
                className="inline-block mt-4 text-sm font-semibold text-heat hover:underline"
                onClick={() => setOpen(false)}
              >
                {t('view_all')} {active.name} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
