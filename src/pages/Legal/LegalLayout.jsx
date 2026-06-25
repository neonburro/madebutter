// src/pages/Legal/LegalLayout.jsx
// Shared shell for terms + privacy. Thin black banner hero with mint + butter
// accents. The logo is the only way home (clickable), no back button.
import { Link } from 'react-router-dom';

const MINT = '#A8B89A';

export default function LegalLayout({ title, intro, updated, children }) {
  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden" style={{ background: 'var(--mb-dark-base)' }}>
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${MINT} 0%, var(--mb-accent-butter) 100%)` }} />
        <div className="mx-auto w-[92%] max-w-3xl py-10">
          <Link to="/" aria-label="madebutter. home" className="inline-block text-2xl font-semibold lowercase" style={{ color: 'var(--mb-dark-text)', letterSpacing: 'var(--tracking-logo)' }}>
            madebutter<span style={{ color: 'var(--mb-dark-accent)' }}>.</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--mb-dark-text)', letterSpacing: 'var(--tracking-heading)' }}>
            {title}
          </h1>
          {intro && <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>{intro}</p>}
          {updated && <p className="mt-4 text-xs uppercase" style={{ color: MINT, letterSpacing: '0.1em' }}>Last updated {updated}</p>}
        </div>
      </div>

      <main className="mx-auto w-[92%] max-w-3xl py-12">
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
          {children}
        </div>

        <div className="mt-14 flex items-center gap-3 border-t pt-6 text-xs lowercase" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-muted)' }}>
          <Link to="/terms/" className="underline">terms</Link>
          <span>·</span>
          <Link to="/privacy/" className="underline">privacy</Link>
          <span>·</span>
          <span>ridgway, colorado</span>
        </div>
      </main>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--mb-text-primary)' }}>{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
