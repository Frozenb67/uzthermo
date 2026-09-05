'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Ruler, Wrench, Check, ArrowRight } from 'lucide-react';
import { FITTINGS_MATRIX, PIPE_MATERIALS } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { useTranslation } from '../lib/i18n/useTranslation';

export default function FittingMatcher() {
  const { t } = useTranslation();
  const [material, setMaterial] = useState(null);
  const [diameter, setDiameter] = useState(null);

  const diameters = material ? Object.keys(FITTINGS_MATRIX[material]) : [];
  const fittings = material && diameter ? FITTINGS_MATRIX[material][diameter] : [];

  function selectMaterial(m) {
    setMaterial(m);
    setDiameter(null);
  }

  function reset() {
    setMaterial(null);
    setDiameter(null);
  }

  const step = !material ? 1 : !diameter ? 2 : 3;

  return (
    <section className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10">
      <div className="flex items-center gap-2 text-heat mb-2">
        <GitBranch size={20} />
        <span className="text-sm font-semibold uppercase tracking-wide">
          {t('fitting_matcher_kicker')}
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-1">
        {t('fitting_matcher_title')}
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        {t('fitting_matcher_sub')}
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= n ? 'bg-heat text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > n ? <Check size={14} /> : n}
            </div>
            {n < 3 && <div className={`h-0.5 flex-1 ${step > n ? 'bg-heat' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Pipe Material */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-charcoal mb-3">{t('step1_material')}</p>
        <div className="grid grid-cols-3 gap-3">
          {PIPE_MATERIALS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => selectMaterial(m)}
              className={`rounded-xl border px-4 py-4 text-sm font-semibold transition-colors ${
                material === m
                  ? 'border-heat bg-heat/5 text-heat'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Diameter */}
      <AnimatePresence>
        {material && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <p className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
              <Ruler size={15} className="text-heat" />
              {t('step2_diameter')}
            </p>
            <div className="flex flex-wrap gap-3">
              {diameters.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiameter(d)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                    diameter === d
                      ? 'border-heat bg-heat text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {d}mm
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Results */}
      <AnimatePresence>
        {material && diameter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Wrench size={15} className="text-heat" />
                {t('step3_results')}: {material} {diameter}mm
              </p>
              <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-heat">
                {t('reset')}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {fittings.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">SKU {item.sku}</p>
                  </div>
                  <span className="text-sm font-semibold text-heat shrink-0">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={`/catalog?category=fittings&pipeType=${material}&diameter=${diameter}mm`}
              className="inline-flex items-center gap-2 mt-6 bg-charcoal text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-charcoal/90 transition-colors"
            >
              {t('view_matching_parts')}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
