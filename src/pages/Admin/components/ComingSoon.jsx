// src/pages/Admin/components/ComingSoon.jsx
// Clean placeholder for admin sections not built yet. Big bold vibe. Optional note
// describing what is coming so the section reads intentional, not empty.
// Last updated 2026-06-27.
import { Sparkles } from 'lucide-react';

export default function ComingSoon({ title, note }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--mb-surface-base)' }}>
        <Sparkles size={28} style={{ color: 'var(--mb-accent-butter)' }} />
      </span>
      <h1 className="mt-6 text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>{title}</h1>
      <p className="mt-2 text-base font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>coming soon</p>
      {note && <p className="mt-4 max-w-md text-base font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>{note}</p>}
    </div>
  );
}
