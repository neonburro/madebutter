// src/components/Footer/Footer.jsx
// Clean white footer, black text, no gradient. Wide, same width across all three
// viewports (w-[98%]). Working email signup. Chef-hat back of house.
// Experimental-kitchen voice.
//
// ── THE ADDRESS LINE NO LONGER SAYS COMING SOON ─────────────────────────────
// It used to read "clinton street, ridgway, colorado (coming soon)", and coming
// soon is the weakest thing a brand can print. It asks to be judged later,
// which reads as an apology for existing now, and it goes stale on its own the
// day somebody forgets to delete it.
//
// What is TRUE is more interesting than what is pending: there is no storefront
// and the kitchen is real and running. Kolache says that in his own words, and
// a fact in a character's voice is worth more than a promise in nobody's.
// No em dashes, oxford commas or colons.
// Last updated 2026-06-27.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import Kolache from '../Kolache/Kolache';
import { SAYS } from '../../data/kolache';

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
            <p className="mt-5 text-sm font-medium" style={{ color: 'var(--mb-text-muted)' }}>
              ridgway, colorado
            </p>
            <a href="tel:+19706967575" className="mt-1 block text-sm font-semibold">(970) 696-7575</a>

            {/* The counter. He is the only character on the site and this is
                the one place he appears unprompted, because a counter is
                somewhere a person stands whether or not you ask them
                anything. Everywhere else he answers something. */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--mb-surface-line)' }}>
              <Kolache say={SAYS.counter} />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--mb-text-muted)' }}>
                {SAYS.notOpenYet}
              </p>
            </div>
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
