'use client';

import { Calculator } from 'lucide-react';
import BoilerCalculator from '../../components/BoilerCalculator';
import FittingMatcher from '../../components/FittingMatcher';

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-heat mb-2">
          <Calculator size={20} />
          <span className="text-xs font-semibold uppercase tracking-wide">Tools Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
          System Calculators &amp; Planning Tools
        </h1>
      </div>

      <BoilerCalculator />
      <FittingMatcher />

      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-sm text-slate-400">
          A dedicated Radiator Section Calculator and Pipe Flow &amp; Pressure Drop Estimator
          are coming next — the underlying math already exists at{' '}
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">POST /api/tools/radiator-sections</code>{' '}
          and <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/pipe-flow</code>.
        </p>
      </div>
    </div>
  );
}
