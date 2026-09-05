'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'Winter Promo',
    title: 'Up to 30% off wall-hung gas boilers',
    subtitle: 'Bosch, Protherm & Ariston — installation included',
    cta: { label: 'Shop Boilers', href: '/catalog?category=boilers' },
    endsAt: Date.now() + 1000 * 60 * 60 * 36,
    gradient: 'from-charcoal via-charcoal to-heat/60',
  },
  {
    id: 2,
    tag: 'New Arrival',
    title: 'WAVIN PPR pipe systems now in stock',
    subtitle: 'Full range from 16mm to 63mm, PN16 rated',
    cta: { label: 'Shop Pipes', href: '/catalog?category=ppr-pipes' },
    endsAt: Date.now() + 1000 * 60 * 60 * 72,
    gradient: 'from-charcoal via-charcoal to-amber-600/50',
  },
  {
    id: 3,
    tag: 'Installer Watch',
    title: 'Boiler mounting tutorial — 12 min video',
    subtitle: 'Certified installers walk through a full setup',
    cta: { label: 'Watch Now', href: '#video-reviews' },
    video: true,
    gradient: 'from-charcoal via-charcoal to-sky-600/50',
  },
];

function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(endsAt ? endsAt - Date.now() : null);

  useEffect(() => {
    if (!endsAt) return undefined;
    const timer = setInterval(() => setRemaining(endsAt - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!endsAt || remaining <= 0) return null;
  const h = Math.floor(remaining / 3.6e6);
  const m = Math.floor((remaining % 3.6e6) / 6e4);
  const s = Math.floor((remaining % 6e4) / 1000);
  return { h, m, s };
}

function CountdownBadge({ endsAt }) {
  const t = useCountdown(endsAt);
  if (!t) return null;
  return (
    <div className="flex items-center gap-1.5 font-mono text-sm bg-white/10 rounded-full px-3 py-1.5">
      {[t.h, t.m, t.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-white/40">:</span>}
          <span className="text-white font-bold">{String(v).padStart(2, '0')}</span>
        </span>
      ))}
    </div>
  );
}

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="relative w-full h-[440px] sm:h-[500px] rounded-3xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} flex items-center`}
        >
          <div className="px-8 sm:px-14 max-w-xl">
            <span className="inline-block bg-heat text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4">
              {slide.tag}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
              {slide.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-base mb-6">{slide.subtitle}</p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2 bg-white text-charcoal font-semibold px-5 py-3 rounded-full hover:bg-ice transition-colors"
              >
                {slide.video && <PlayCircle size={18} />}
                {slide.cta.label}
                {!slide.video && <ArrowRight size={16} />}
              </Link>
              {slide.endsAt && <CountdownBadge endsAt={slide.endsAt} />}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
