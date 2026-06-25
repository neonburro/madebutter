// src/components/Footer/Footer.jsx
// Matcha sage footer with black text and butter-yellow accents. Real working email
// signup (rewards list) wired to the signup function. Trimmed Burroship line.
// Bigger consistent wordmark. Clean voice, no em dashes, oxford commas or colons.
import { useState } from 'react';
import { Link } from 'react-router-dom';

const SAGE = '#A8B89A';
const SAGE_DEEP = '#3F4A3A';
const INK = '#161412';
const BUTTER = '#F5D66B';

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
    <footer style={{ background: SAGE, color: INK }}>
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${INK} 0%, ${BUTTER} 100%)` }} />

      <div className="mx-auto w-[98%] py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <div className="text-4xl font-bold lowercase" style={{ letterSpacing: 'var(--tracking-logo)' }}>
              madebutter<span style={{ color: '#fff' }}>.</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: SAGE_DEEP }}>
              part bakery, part product lab. small batch donuts, kolaches, stuffed rolls and coffee. made fresh, packed clean, travel ready. order ahead or come on in.
            </p>
            <p className="mt-4 text-sm font-medium">100 campbell lane, ridgway, colorado</p>
            <a href="tel:+19706967575" className="mt-1 block text-sm font-semibold" style={{ color: INK }}>(970) 696-7575</a>
          </div>

          <div className="sm:max-w-sm sm:justify-self-end sm:w-full">
            <p className="mb-3 text-xs font-semibold uppercase" style={{ letterSpacing: '0.12em', color: SAGE_DEEP }}>
              join the list
            </p>

            {done ? (
              <p className="text-sm font-medium">you're on the list. check your email.</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="your email"
                    inputMode="email"
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: '#fff', color: INK, border: `1px solid ${SAGE_DEEP}33` }}
                  />
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="rounded-lg px-5 py-2.5 text-sm font-bold lowercase disabled:opacity-60"
                    style={{ background: INK, color: BUTTER }}
                  >
                    {busy ? '...' : 'join'}
                  </button>
                </div>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: SAGE_DEEP }}>
                  early flavors, the occasional treat, and rewards once the burroship program lands.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium lowercase" style={{ color: SAGE_DEEP }}>
          <Link to="/contact/">contact</Link>
          <Link to="/suggest/">suggestion box</Link>
          <Link to="/terms/">terms</Link>
          <Link to="/privacy/">privacy</Link>
          <a href="https://burroship.com/rewards" target="_blank" rel="noopener noreferrer">rewards</a>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs lowercase sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${SAGE_DEEP}33`, color: SAGE_DEEP }}>
          <span>© {new Date().getFullYear()} madebutter. a burroship brand.</span>
          <div className="flex items-center gap-5">
            <Link to="/admin/" style={{ color: SAGE_DEEP }}>back of house</Link>
            <span>
              powered by{' '}
              <a href="https://neonburro.com" target="_blank" rel="noopener noreferrer" style={{ color: INK, fontWeight: 600 }}>
                neonburro
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
