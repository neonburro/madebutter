// src/pages/Admin/components/AdminShell.jsx
// Post-login admin home. Same butter system as the storefront.
import { useAuth } from '../../../context/AuthContext';

export default function AdminShell() {
  const { staff, signOut } = useAuth();
  const name = staff?.display_name || 'there';

  const tiles = [
    { key: 'menu', label: 'Menu', desc: 'Categories, items, availability' },
    { key: 'orders', label: 'Orders', desc: 'Live order board, lockers' },
    { key: 'hero', label: 'Hero', desc: 'Homepage slides' },
  ];

  return (
    <main className="min-h-screen w-full" style={{ background: 'var(--mb-surface-paper)' }}>
      <header className="border-b" style={{ borderColor: 'var(--mb-surface-line)', background: 'var(--mb-surface-base)' }}>
        <div className="mx-auto flex w-[98%] items-center justify-between py-3">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--mb-text-secondary)' }}>Hi, {name}</span>
            <button onClick={signOut} className="text-sm font-medium" style={{ color: 'var(--mb-text-muted)' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-[98%] max-w-4xl py-12">
        <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Admin</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>Manage the menu, orders and homepage.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((t) => (
            <div
              key={t.key}
              className="rounded-2xl p-6"
              style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)' }}
            >
              <p className="text-lg font-semibold">{t.label}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>{t.desc}</p>
              <p className="mt-4 text-xs" style={{ color: 'var(--mb-accent-toast)' }}>Coming next</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
