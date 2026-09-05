'use client';

import { useState } from 'react';
import { MapPin, Send, Clock, Image as ImageIcon, Map as MapIcon } from 'lucide-react';

const TELEGRAM_HANDLE = 'uztherrmo_bot';
const ADDRESS = "Tashkent, Chilanzar district, Bunyodkor shoh ko'chasi 12";

export default function ShowroomLocator() {
  const [view, setView] = useState('map'); // 'map' | 'gallery'

  return (
    <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-2 text-heat mb-2">
            <MapPin size={20} />
            <span className="text-sm font-semibold uppercase tracking-wide">Visit Our Showroom</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-4">{ADDRESS}</h2>

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Clock size={15} className="text-amber-500" />
            Daily, 9:00 AM – 7:00 PM
          </div>

          <div className="inline-flex rounded-full bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                view === 'map' ? 'bg-white text-charcoal shadow-sm' : 'text-slate-500'
              }`}
            >
              <MapIcon size={14} /> Map
            </button>
            <button
              type="button"
              onClick={() => setView('gallery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                view === 'gallery' ? 'bg-white text-charcoal shadow-sm' : 'text-slate-500'
              }`}
            >
              <ImageIcon size={14} /> Floor Plan
            </button>
          </div>

          <a
            href={`https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(`Send me the showroom location: ${ADDRESS}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-heat text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-heat/90 transition-colors"
          >
            <Send size={16} />
            Send location to my Telegram
          </a>
        </div>

        <div className="min-h-[280px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          {view === 'map' ? 'Interactive map preview' : 'Showroom floor plan / photo gallery'}
        </div>
      </div>
    </section>
  );
}
