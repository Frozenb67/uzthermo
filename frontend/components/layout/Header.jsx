'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flame, Heart, GitCompare, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import MegaMenu from './MegaMenu';
import SearchAutocomplete from './SearchAutocomplete';
import AuthModal from './AuthModal';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCompareStore } from '../../store/useCompareStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../lib/i18n/useTranslation';

const ADMIN_ROLES = ['admin', 'manager', 'warehouse_clerk'];

function CounterLink({ href, icon: Icon, count, label }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center w-11 h-11 rounded-full hover:bg-slate-100 transition-colors text-charcoal"
      aria-label={label}
      title={label}
    >
      <Icon size={19} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-heat text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [authOpen, setAuthOpen] = useState(false);

  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.count());
  const compareCount = useCompareStore((s) => s.count());
  const user = useAuthStore((s) => s.user);

  const isStaff = user && ADMIN_ROLES.includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-heat flex items-center justify-center">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-charcoal">
            Uz<span className="text-heat">Thermo</span>
          </span>
        </Link>

        <MegaMenu />

        <div className="hidden lg:block flex-1">
          <SearchAutocomplete />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <CounterLink href="/compare" icon={GitCompare} count={compareCount} label={t('compare')} />
          <CounterLink href="/wishlist" icon={Heart} count={wishlistCount} label={t('wishlist')} />
          <CounterLink href="/cart" icon={ShoppingCart} count={cartCount} label={t('cart')} />

          {isStaff && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-full bg-charcoal text-white hover:bg-charcoal/90 transition-colors text-sm font-semibold"
            >
              <ShieldCheck size={15} />
              <span className="hidden sm:inline">{t('admin_panel')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-2 ml-1 pl-3 pr-4 py-2 rounded-full border border-slate-200 hover:border-heat hover:text-heat transition-colors text-sm font-semibold"
          >
            <User size={16} />
            {user ? user.name.split(' ')[0] : t('sign_in')}
          </button>
        </div>
      </div>

      <div className="lg:hidden px-4 pb-3">
        <SearchAutocomplete />
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
