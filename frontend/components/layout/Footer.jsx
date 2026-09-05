'use client';

import Link from 'next/link';
import { Flame, Phone, Send } from 'lucide-react';
import { CATEGORIES } from '../../lib/mockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-charcoal text-ice/70 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-heat flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="text-white font-extrabold">
              Uz<span className="text-heat">Thermo</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">{t('footer_tagline')}</p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">{t('footer_catalog')}</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat.slug}>
                <Link href={`/catalog?category=${cat.slug}`} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">{t('footer_company')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tools" className="hover:text-white transition-colors">{t('calculators_tools')}</Link></li>
            <li><Link href="/installers" className="hover:text-white transition-colors">{t('find_installer')}</Link></li>
            <li><Link href="/compare" className="hover:text-white transition-colors">{t('compare_products_link')}</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">{t('admin_panel')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">{t('footer_contact')}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-heat" /> +998 97 333 33 43
            </li>
            <li className="flex items-center gap-2">
              <Send size={14} className="text-sky-400" /> @uztherrmo_bot
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-ice/50">
        © {new Date().getFullYear()} UzThermo. {t('all_rights_reserved')}
      </div>
    </footer>
  );
}
