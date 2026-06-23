// src/pages/Admin/components/AdminShell.jsx
// Admin chrome: side nav on desktop, bottom nav on mobile. Same butter system.
// Renders the active section via nested <Outlet/>.
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, Boxes, Image, Receipt, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const NAV = [
  { to: '/admin/', end: true, label: 'Home', icon: LayoutGrid },
  { to: '/admin/menu/', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/inventory/', label: 'Inventory', icon: Boxes },
  { to: '/admin/hero/', label: 'Hero', icon: Image },
  { to: '/admin/orders/', label: 'Orders', icon: Receipt },
];

export default function AdminShell() {
  const { staff, signOut } = useAuth();
  const name = staff?.display_name || 'there';

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--mb-surface-paper)' }}>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r sm:flex" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <div className="px-6 py-5">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-8 w-auto" />
        </div>
        <nav className="flex-1 px-3 py-2">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                background: isActive ? 'var(--mb-surface-cream)' : 'transparent',
                color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-secondary)',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t px-3 py-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="px-3 pb-2 text-xs" style={{ color: 'var(--mb-text-muted)' }}>hi, {name}</p>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium" style={{ color: 'var(--mb-text-muted)' }}>
            <LogOut size={18} />
            sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 sm:hidden" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <img src="/madebutter-logo.png" alt="madebutter." className="h-7 w-auto" />
        <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>
          <LogOut size={15} /> sign out
        </button>
      </header>

      <main className="pb-24 sm:ml-60 sm:pb-0">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t sm:hidden" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        {NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            style={({ isActive }) => ({ color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-muted)' })}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
