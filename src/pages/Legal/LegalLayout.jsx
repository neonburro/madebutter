// src/pages/Legal/LegalLayout.jsx
// Shared shell for terms + privacy. Thin black banner hero with mint + butter
// accents. The logo is the only way home (clickable), no back button. Big bold
// readable body to match the house style. No em dashes, oxford commas or colons.
import { Link } from 'react-router-dom';

// Was a mint #A8B89A that appeared nowhere else in the theme, left over from
// an older palette. Toast is the theme's second colour and it is already the
// warning and metadata tone, which is what a last updated stamp is.

export default function LegalLayout({ title, intro, updated, children }) {
  return (
    <div className="w-full">
      {/* thin black banner hero */}
      <div className="relative w-full overflow-hidden" style={{ background: 'var(--mb-dark-base)' }}>
        <div style={{ height: '4px', background: `linear-gradient(90deg, var(--mb-accent-toast) 0%, var(--mb-accent-butter) 100%)` }} />
        <div className="mx-auto w-[92%] max-w-3xl py-12">
          <Link to="/" aria-label="madebutter. home" className="inline-block text-3xl font-bold lowercase" style={{ color: 'var(--mb-dark-text)', letterSpacing: 'var(--tracking-logo)' }}>
            madebutter<span style={{ color: 'var(--mb-dark-accent)' }}>.</span>
          </Link>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl" style={{ color: 'var(--mb-dark-text)', letterSpacing: 'var(--tracking-heading)' }}>
            {title}
          </h1>
          {intro && <p className="mt-4 max-w-xl text-lg font-semibold leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>{intro}</p>}
          {updated && <p className="mt-5 text-xs font-bold uppercase" style={{ color: 'var(--mb-accent-toast)', letterSpacing: '0.12em' }}>Last updated {updated}</p>}
        </div>
      </div>

      {/* body */}
      <main className="mx-auto w-[92%] max-w-3xl py-14">
        <div className="space-y-10 text-base font-medium leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
          {children}
        </div>

        <div className="mt-16 flex items-center gap-3 border-t pt-8 text-sm font-semibold lowercase" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-muted)' }}>
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
      <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--mb-text-primary)' }}>{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
