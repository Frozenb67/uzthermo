'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, ArrowUpDown, Wind, Layers, ArrowRight, Milestone } from 'lucide-react';
import { useTranslation } from '../lib/i18n/useTranslation';

// Rough HVAC rule-of-thumb specific heat load (W/m^2) at a 2.7m reference ceiling.
const INSULATION_PROFILES = {
  poor: { key: 'poor', wattsPerM2: 150 },
  average: { key: 'average', wattsPerM2: 100 },
  excellent: { key: 'excellent', wattsPerM2: 70 },
};

const REFERENCE_HEIGHT_M = 2.7;
const SAFETY_MARGIN = 1.2; // covers domestic hot water + heat loss variance
const WALL_LOSS_STEP = 0.05; // +5% heat demand per exterior wall beyond the first

// Recommended supply-pipe diameter for a given boiler output (typical residential sizing).
const PIPE_DIAMETER_BY_KW = [
  { maxKW: 15, diameter: '16mm' },
  { maxKW: 24, diameter: '20mm' },
  { maxKW: 35, diameter: '25mm' },
  { maxKW: Infinity, diameter: '32mm' },
];

function round(value, step) {
  return Math.round(value / step) * step;
}

function recommendedDiameter(kW) {
  return PIPE_DIAMETER_BY_KW.find((row) => kW <= row.maxKW).diameter;
}

function computeRequiredKW({ area, ceilingHeight, insulation, exteriorWalls }) {
  const profile = INSULATION_PROFILES[insulation];
  const heightFactor = Math.max(0.85, ceilingHeight / REFERENCE_HEIGHT_M);
  const wallFactor = 1 + Math.max(0, exteriorWalls - 1) * WALL_LOSS_STEP;

  const rawKW = (area * profile.wattsPerM2 * heightFactor * wallFactor * SAFETY_MARGIN) / 1000;
  const recommendedKW = Math.max(12, Math.ceil(rawKW / 2) * 2);

  return {
    rawKW: Math.round(rawKW * 10) / 10,
    recommendedKW,
    minKW: Math.max(8, round(recommendedKW * 0.85, 2)),
    maxKW: round(recommendedKW * 1.25, 2),
    pipeDiameter: recommendedDiameter(recommendedKW),
  };
}

export default function BoilerCalculator() {
  const { t } = useTranslation();
  const router = useRouter();

  const [area, setArea] = useState(80);
  const [ceilingHeight, setCeilingHeight] = useState(2.7);
  const [insulation, setInsulation] = useState('average');
  const [exteriorWalls, setExteriorWalls] = useState(2);

  const result = useMemo(
    () => computeRequiredKW({ area, ceilingHeight, insulation, exteriorWalls }),
    [area, ceilingHeight, insulation, exteriorWalls]
  );

  function goToCatalog() {
    router.push(`/catalog?category=boilers&minKW=${result.minKW}&maxKW=${result.maxKW}`);
  }

  return (
    <section className="w-full bg-charcoal text-white rounded-3xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Controls */}
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Flame size={20} />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {t('boiler_calculator_kicker')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            {t('boiler_calculator_title')}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {t('boiler_calculator_sub')}
          </p>

          {/* Room Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="area" className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Home size={16} className="text-amber-500" />
                {t('room_area')}
              </label>
              <span className="text-sm font-semibold text-amber-500">{area} m²</span>
            </div>
            <input
              id="area"
              type="range"
              min={10}
              max={300}
              step={5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full accent-heat cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10 m²</span>
              <span>300 m²</span>
            </div>
          </div>

          {/* Ceiling Height */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="height" className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <ArrowUpDown size={16} className="text-amber-500" />
                {t('ceiling_height')}
              </label>
              <span className="text-sm font-semibold text-amber-500">{ceilingHeight.toFixed(1)} m</span>
            </div>
            <input
              id="height"
              type="range"
              min={2.2}
              max={4.5}
              step={0.1}
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(Number(e.target.value))}
              className="w-full accent-heat cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>2.2 m</span>
              <span>4.5 m</span>
            </div>
          </div>

          {/* Insulation Quality */}
          <div className="mb-6">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
              <Layers size={16} className="text-amber-500" />
              {t('insulation_quality')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(INSULATION_PROFILES).map(([key, profile]) => {
                const active = insulation === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInsulation(key)}
                    className={`rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                      active
                        ? 'border-heat bg-heat/10 text-heat'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {t(profile.key)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Exterior Walls */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="walls" className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Wind size={16} className="text-amber-500" />
                {t('exterior_walls')}
              </label>
              <span className="text-sm font-semibold text-amber-500">{exteriorWalls}</span>
            </div>
            <input
              id="walls"
              type="range"
              min={1}
              max={4}
              step={1}
              value={exteriorWalls}
              onChange={(e) => setExteriorWalls(Number(e.target.value))}
              className="w-full accent-heat cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>4</span>
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-heat to-heat/70">
          <span className="text-sm font-medium uppercase tracking-wide text-white/80">
            {t('recommended_output')}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={result.recommendedKW}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex items-baseline gap-2 my-4"
            >
              <span className="text-6xl sm:text-7xl font-extrabold text-white">
                {result.recommendedKW}
              </span>
              <span className="text-2xl font-semibold text-white/80">kW</span>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 mb-6">
            <Milestone size={15} className="text-white" />
            <span className="text-sm font-medium text-white">
              {t('recommended_pipe')}: <strong>{result.pipeDiameter}</strong>
            </span>
          </div>

          <p className="text-white/80 text-sm text-center max-w-xs mb-8">
            Estimated raw heat demand: <strong className="text-white">{result.rawKW} kW</strong>.
            Look for boilers rated <strong className="text-white">{result.minKW}–{result.maxKW} kW</strong>{' '}
            for a comfortable margin.
          </p>

          <button
            type="button"
            onClick={goToCatalog}
            className="inline-flex items-center gap-2 bg-white text-heat font-semibold px-6 py-3 rounded-full hover:bg-ice transition-colors shadow-lg"
          >
            {t('filter_compatible_boilers')}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
