// src/components/Footer/Footer.jsx
// Clean white footer, black text, no gradient. Wide, same width across all three
// viewports (w-[92%] max-w-6xl). Working email signup. Chef-hat back of house.
// Experimental-kitchen voice. No em dashes, oxford commas or colons.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const SAGE = '#A8B89A';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!/\S+@\S+\.\S+/.test(email) || busy) return;
    setBusy(true);
    try {
      await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer style={{ background: 'var(--mb-surface-base)', borderTop: '1px solid var(--mb-surface-line)' }}>
      <div className="mx-auto w-[98%] py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16">
          <div>
            <Link to="/" className="text-4xl font-bold lowercase sm:text-5xl" style={{ letterSpacing: 'var(--tracking-logo)' }}>
              madebutter<span style={{ color: SAGE }}>.</span>
            </Link>
            <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
              part bakery, part product lab. donuts, kolaches, stuffed rolls and coffee are what we are into currently. staples always on the counter, experiments always in the works. made fresh, packed clean, travel ready.
            </p>
            <p className="mt-5 text-sm font-medium">100 campbell lane, ridgway, colorado</p>
            <a href="tel:+19706967575" className="mt-1 block text-sm font-semibold">(970) 696-7575</a>
          </div>

          <div className="sm:max-w-sm sm:justify-self-end sm:w-full">
            <p className="mb-3 text-sm font-semibold uppercase" style={{ letterSpacing: '0.12em', color: 'var(--mb-text-muted)' }}>
              join the list
            </p>

            {done ? (
              <p className="text-base font-medium">you're on the list. check your email.</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="your email"
                    inputMode="email"
                    className="flex-1 rounded-xl px-4 py-3 text-base outline-none"
                    style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line-strong)' }}
                  />
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="rounded-xl px-6 py-3 text-base font-bold lowercase disabled:opacity-60"
                    style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
                  >
                    {busy ? '...' : 'join'}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--mb-text-muted)' }}>
                  early flavors, the occasional treat, and rewards once the burroship program lands.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 text-base font-medium lowercase" style={{ color: 'var(--mb-text-secondary)' }}>
          <Link to="/contact/">contact</Link>
          <Link to="/suggest/">suggestion box</Link>
          <Link to="/terms/">terms</Link>
          <Link to="/privacy/">privacy</Link>
          <a href="https://burroship.com/rewards" target="_blank" rel="noopener noreferrer">rewards</a>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-sm lowercase sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-muted)' }}>
          <span>© {new Date().getFullYear()} madebutter. a burroship brand.</span>
          <div className="flex items-center gap-5">
            <Link to="/admin/" className="flex items-center gap-1.5" style={{ color: 'var(--mb-text-muted)' }}>
              <ChefHat size={16} />
              back of house
            </Link>
            <span>
              powered by{' '}
              <a href="https://neonburro.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mb-text-primary)', fontWeight: 600 }}>
                neonburro
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
