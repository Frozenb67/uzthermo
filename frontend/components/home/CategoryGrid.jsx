'use client';

import Link from 'next/link';
import { Flame, Thermometer, Wrench, Waves, AlignJustify, GitBranch, Droplets } from 'lucide-react';
import { CATEGORIES } from '../../lib/mockData';

const ICONS = {
  Flame,
  Thermometer,
  PipetteIcon: Droplets,
  Wrench,
  Waves,
  AlignJustify,
  GitBranch,
};

export default function CategoryGrid() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-charcoal mb-5">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] || Flame;
          return (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center hover:border-heat hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-heat/5 text-heat flex items-center justify-center group-hover:bg-heat group-hover:text-white transition-colors">
                <Icon size={22} />
              </div>
              <span className="text-xs font-semibold text-charcoal leading-tight">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
