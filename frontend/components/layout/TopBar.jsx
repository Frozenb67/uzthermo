'use client';

import { useState } from 'react';
import { Phone, MapPin, Send, Clock, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../lib/i18n/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';

const HOTLINE = '+998 97 333 33 43';
const TELEGRAM_HANDLE = 'uztherrmo_bot';
const SHOWROOM_ADDRESS = 'Tashkent, Chilanzar district, Bunyodkor shoh ko\'chasi 12';

export default function TopBar() {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState('UZS');
  const [showMapDrawer, setShowMapDrawer] = useState(false);

  return (
    <div className="bg-charcoal text-ice/80 text-xs relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white transition-colors shrink-0">
            <Phone size={13} className="text-heat" />
            <span className="font-medium">{HOTLINE}</span>
          </a>

          <button
            type="button"
            onClick={() => setShowMapDrawer(true)}
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors truncate"
          >
            <MapPin size={13} className="text-amber-500" />
            <span className="truncate">{t('showroom_location')}</span>
          </button>

          <span className="hidden md:flex items-center gap-1.5 text-ice/60">
            <Clock size={13} />
            {t('working_hours')}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href={`https://t.me/${TELEGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Send size={13} className="text-sky-400" />
            {t('telegram')}
          </a>

          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setCurrency((c) => (c === 'UZS' ? 'USD' : 'UZS'))}
            className="flex items-center gap-1 hover:text-white transition-colors font-semibold"
            title="Toggle displayed currency"
          >
            {currency}
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {showMapDrawer && (
        <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close"
            className="flex-1 bg-black/50"
            onClick={() => setShowMapDrawer(false)}
          />
          <div className="w-full max-w-sm bg-white text-charcoal h-full p-6 overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold mb-2">{t('showroom_service_center')}</h3>
            <p className="text-sm text-slate-600 mb-4">{SHOWROOM_ADDRESS}</p>
            <div className="aspect-video w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm mb-4">
              {t('map_preview')}
            </div>
            <a
              href={`https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(`Send me the showroom location: ${SHOWROOM_ADDRESS}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-heat text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-heat/90 transition-colors"
            >
              <Send size={15} />
              {t('send_location_telegram')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
