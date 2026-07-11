// src/pages/Admin/components/AdminShell.jsx
// Admin chrome matched to the front end: white base, black text, yellow + sage
// accents, bigger logo, bolder type. Sidebar order: Dashboard, Orders, POS, Loyalty,
// Menu, Brand. Loyalty is not a page; it opens a thin slide-out with Customers,
// Rewards, Signups. Desktop side nav + mobile bottom nav with an active yellow dot.
// Last updated 2026-06-27.
import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid, Receipt, ScanLine, Heart, UtensilsCrossed, Palette,
  Settings, LogOut, Users, Gift, Mail, ChevronRight, X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const NAV = [
  { key: 'dashboard', to: '/admin/', end: true, label: 'Dashboard', icon: LayoutGrid },
  { key: 'orders', to: '/admin/orders/', label: 'Orders', icon: Receipt },
  { key: 'pos', to: '/admin/pos/', label: 'POS', icon: ScanLine },
  { key: 'loyalty', label: 'Loyalty', icon: Heart, slideout: true },
  { key: 'menu', to: '/admin/menu/', label: 'Menu', icon: UtensilsCrossed },
  { key: 'brand', to: '/admin/brand/', label: 'Brand', icon: Palette },
];

const LOYALTY = [
  { to: '/admin/loyalty/customers/', label: 'Customers', icon: Users, desc: 'everyone who has ordered' },
  { to: '/admin/loyalty/rewards/', label: 'Rewards', icon: Gift, desc: 'donut points and status' },
  { to: '/admin/loyalty/signups/', label: 'Signups', icon: Mail, desc: 'email and sms list to export' },
];

function LoyaltySlideout({ open, onClose }) {
  const navigate = useNavigate();
  const go = (to) => { onClose(); navigate(to); };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,14,13,0.35)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-y-0 left-0 z-[70] flex w-80 max-w-[85%] flex-col p-6 sm:left-64"
            style={{ background: 'var(--mb-surface-base)', boxShadow: '8px 0 40px rgba(0,0,0,0.14)' }}
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Loyalty</h2>
              <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={24} /></button>
            </div>
            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Pick where to go.</p>

            <div className="mt-6 flex flex-col gap-2">
              {LOYALTY.map(({ to, label, icon: Icon, desc }) => (
                <button key={to} onClick={() => go(to)}
                  className="flex items-center gap-3 rounded-2xl p-4 text-left transition-colors"
                  style={{ background: 'var(--mb-surface-paper)' }}>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--mb-surface-base)' }}>
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold">{label}</span>
                    <span className="block text-sm font-medium" style={{ color: 'var(--mb-text-muted)' }}>{desc}</span>
                  </span>
                  <ChevronRight size={18} style={{ color: 'var(--mb-text-muted)' }} />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminShell() {
  const { staff, signOut } = useAuth();
  const name = staff?.display_name || 'there';
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  const itemClass = 'mb-1.5 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold transition-colors';
  const itemStyle = (isActive) => ({
    background: isActive ? 'var(--mb-text-primary)' : 'transparent',
    color: isActive ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)',
  });

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--mb-surface-paper)' }}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r sm:flex" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <div className="px-6 py-7">
          <Link to="/" aria-label="madebutter. home">
            <img src="/madebutter-logo.png" alt="madebutter." className="h-11 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 px-3 py-2">
          {NAV.map(({ key, to, end, label, icon: Icon, slideout }) =>
            slideout ? (
              <button key={key} onClick={() => setLoyaltyOpen(true)} className={itemClass} style={itemStyle(false)}>
                <Icon size={20} strokeWidth={2.2} />
                {label}
                <ChevronRight size={16} className="ml-auto" style={{ color: 'var(--mb-text-muted)' }} />
              </button>
            ) : (
              <NavLink key={key} to={to} end={end} className={itemClass} style={({ isActive }) => itemStyle(isActive)}>
                <Icon size={20} strokeWidth={2.2} />
                {label}
              </NavLink>
            )
          )}
        </nav>
        <div className="border-t px-3 py-5" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <NavLink to="/admin/account/" className={itemClass} style={({ isActive }) => itemStyle(isActive)}>
            <Settings size={20} /> account
          </NavLink>
          <p className="px-4 pb-2 pt-2 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>hi, {name}</p>
          <button onClick={signOut} className={itemClass} style={itemStyle(false)}>
            <LogOut size={20} /> sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 sm:hidden" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <Link to="/" aria-label="madebutter. home">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-9 w-auto" />
        </Link>
        <button onClick={signOut} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--mb-text-muted)' }}>
          <LogOut size={16} /> sign out
        </button>
      </header>

      <main className="pb-28 sm:ml-64 sm:pb-0">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t sm:hidden" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ key, to, end, label, icon: Icon, slideout }) =>
          slideout ? (
            <button key={key} onClick={() => setLoyaltyOpen(true)} className="relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-bold" style={{ color: 'var(--mb-text-muted)' }}>
              <Icon size={22} strokeWidth={2.2} />
              {label}
            </button>
          ) : (
            <NavLink key={key} to={to} end={end} className="relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-bold" style={({ isActive }) => ({ color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-muted)' })}>
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={2.2} />
                  {label}
                  {isActive && <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: 'var(--mb-accent-butter)' }} />}
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      <LoyaltySlideout open={loyaltyOpen} onClose={() => setLoyaltyOpen(false)} />
    </div>
  );
}
