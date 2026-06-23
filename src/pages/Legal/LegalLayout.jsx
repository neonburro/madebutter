// src/pages/Legal/LegalLayout.jsx
// Shared shell for terms + privacy. Clean, readable, on-brand.
import { Link } from 'react-router-dom';
import Wordmark from '../../components/Brand/Wordmark';

export default function LegalLayout({ title, updated, children }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link to="/" className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>← back to madebutter.</Link>
      <div className="mt-6 mb-8"><Wordmark className="text-2xl" /></div>
      <h1 className="text-3xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>{title}</h1>
      {updated && <p className="mt-2 text-sm" style={{ color: 'var(--mb-text-muted)' }}>Last updated {updated}</p>}
      <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
        {children}
      </div>
      <div className="mt-12 border-t pt-6 text-xs" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-muted)' }}>
        <Link to="/terms/" className="underline">terms</Link>
        <span className="mx-2">·</span>
        <Link to="/privacy/" className="underline">privacy</Link>
        <span className="mx-2">·</span>
        ridgway, colorado
      </div>
    </main>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold" style={{ color: 'var(--mb-text-primary)' }}>{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
