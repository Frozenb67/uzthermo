'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wrench,
  Image as ImageIcon,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import AuthModal from '../../components/layout/AuthModal';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/installers', label: 'Installers', icon: Wrench },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
];

const ALLOWED_ROLES = ['admin', 'manager', 'warehouse_clerk'];

export default function AdminLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [authOpen, setAuthOpen] = useState(false);

  const authorized = user && ALLOWED_ROLES.includes(user.role);

  if (!authorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert size={40} className="mx-auto text-heat mb-4" />
        <h1 className="text-xl font-bold text-charcoal mb-2">Admin access required</h1>
        <p className="text-sm text-slate-500 mb-6">
          {user
            ? `Signed in as ${user.email}, but this account (role: ${user.role}) doesn't have dashboard access.`
            : 'Sign in with an admin or manager account to view the dashboard.'}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-2 bg-heat text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-heat/90 transition-colors"
          >
            Sign in
          </button>
        )}
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-56 shrink-0">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 lg:sticky lg:top-24">
            <p className="text-xs text-slate-400 px-2 mb-3">
              Signed in as <span className="font-semibold text-charcoal">{user.name}</span> ({user.role})
            </p>
            <nav className="space-y-1">
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 mt-3 rounded-lg text-sm text-slate-400 hover:text-heat hover:bg-heat/5 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ item }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-heat/10 text-heat' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} />
      {item.label}
    </Link>
  );
}
