// src/pages/Admin/components/AdminShell.jsx
// Admin chrome matched to the front end: white base, black text, yellow + sage
// accents, bigger logo, bolder type. Desktop side nav, mobile bottom nav with an
// active yellow dot. Hero is now Brand. Renders the active section via <Outlet/>.
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, Palette, Receipt, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SAGE = '#A8B89A';

const NAV = [
  { to: '/admin/', end: true, label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/orders/', label: 'Orders', icon: Receipt },
  { to: '/admin/menu/', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/brand/', label: 'Brand', icon: Palette },
];

export default function AdminShell() {
  const { staff, signOut } = useAuth();
  const name = staff?.display_name || 'there';

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--mb-surface-paper)' }}>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r sm:flex" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <div className="px-6 py-7">
          <Link to="/" aria-label="madebutter. home">
            <img src="/madebutter-logo.png" alt="madebutter." className="h-11 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 px-3 py-2">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="mb-1.5 flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold transition-colors"
              style={({ isActive }) => ({
                background: isActive ? 'var(--mb-text-primary)' : 'transparent',
                color: isActive ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)',
              })}
            >
              <Icon size={20} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t px-3 py-5" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <NavLink to="/admin/account/" className="mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold" style={({ isActive }) => ({ background: isActive ? 'var(--mb-text-primary)' : 'transparent', color: isActive ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)' })}>
            <Settings size={20} />
            account
          </NavLink>
          <p className="px-4 pb-2 pt-2 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>hi, {name}</p>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold" style={{ color: 'var(--mb-text-muted)' }}>
            <LogOut size={20} />
            sign out
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
        {NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-bold"
            style={({ isActive }) => ({ color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-muted)' })}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={2.2} />
                {label}
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: 'var(--mb-accent-butter)' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
