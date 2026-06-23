// src/pages/Admin/components/AdminHome.jsx
// Admin landing inside the shell. Quick links to the sections.
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function AdminHome() {
  const { staff } = useAuth();
  const name = staff?.display_name || 'there';
  const tiles = [
    { to: '/admin/menu/', label: 'Menu', desc: 'Items, prices, availability, inventory' },
    { to: '/admin/hero/', label: 'Hero', desc: 'Homepage slides' },
    { to: '/admin/orders/', label: 'Orders', desc: 'Live order board' },
  ];
  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Hi, {name}</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>What are we working on?</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-2xl p-6 transition-transform active:scale-[0.99]" style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)' }}>
            <p className="text-lg font-semibold">{t.label}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
