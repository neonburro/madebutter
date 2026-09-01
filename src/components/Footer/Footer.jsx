// src/components/Footer/Footer.jsx
//
// ── THE SHOP CLOSING UP ─────────────────────────────────────────────────────
//
// Dark, warm, and it ends on the name at full size. The page above it is warm
// paper, so this is the one hard edge in the design and it is meant to be: the
// menu stops here and the room goes quiet.
//
// The ground is --mb-dark-base, which is a warm cocoa rather than black for the
// same reason the ink is. A true black under a paper page reads as a different
// site bolted on at the bottom.
//
// ── THE WORDMARK IS THE ANCHOR, NOT THE HEADLINE ────────────────────────────
//
// It used to open the footer at 4xl with the about paragraph under it, which
// repeated a line the band under the hero already says, in a smaller size, to
// somebody who has just scrolled past it. Saying a thing twice makes it worth
// less than saying it once.
//
// So the copy is gone and the name moved to the BOTTOM at full width, like a
// stamp on the side of a box. It is the last thing on the page and it is the
// only thing here allowed to be big.
//
// ── WHO IS IN HERE ──────────────────────────────────────────────────────────
//
// Kolache, in a circle, because on every property in this family burros get
// circles and hue mans get rounded squares. It is never explained anywhere and
// it is always obeyed. This is the one place he speaks without being asked
// something, because a counter is somewhere a person stands whether or not you
// have a question. See src/data/kolache.js.
//
// The address line still refuses to say coming soon. What is TRUE is more
// interesting than what is pending, and Kolache says the true version.
//
// neonburro is lowercase ALWAYS. It is set in type here because this repo has
// no copy of the mark. Drop a neonburro-mark.png into public and swap the span
// for it inside a CIRCLE, which is what the other properties in the family do.
//
// ── THE PERIOD IS BUTTER ────────────────────────────────────────────────────
//
// It was sage, #A8B89A, a colour that appears nowhere else in the theme and was
// left over from an older palette. The period after the wordmark is the brand's
// one piece of punctuation and it wears the brand's one accent.
//
// No em dashes, oxford commas or colons.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import Kolache from '../Kolache/Kolache';
import { SAYS } from '../../data/kolache';

const LINKS = [
  { to: '/contact/', label: 'contact' },
  { to: '/suggest/', label: 'suggestion box' },
  { to: '/terms/', label: 'terms' },
  { to: '/privacy/', label: 'privacy' },
];

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
    <footer style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
      <div className="mx-auto w-[92%] max-w-[1680px] pt-16 sm:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Kolache say={SAYS.counter} tone="dark" />
            <p className="mt-4 max-w-sm text-base leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>
              {SAYS.notOpenYet}
            </p>

            <div className="mt-8 flex flex-col gap-1 text-base">
              <span style={{ color: 'var(--mb-dark-muted)' }}>ridgway, colorado</span>
              <a href="tel:+19706967575" className="font-semibold" style={{ color: 'var(--mb-dark-text)' }}>
                (970) 696-7575
              </a>
            </div>
          </div>

          <div className="lg:max-w-sm lg:w-full lg:justify-self-end">
            <p className="mb-3 text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-dark-muted)' }}>
              join the list
            </p>

            {done ? (
              <p className="text-base font-semibold">you are on the list. check your email.</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="your email"
                    inputMode="email"
                    aria-label="Your email"
                    className="min-h-[52px] flex-1 rounded-xl px-4 text-base font-semibold outline-none"
                    style={{
                      background: 'var(--mb-dark-raised)',
                      border: '1px solid var(--mb-dark-line)',
                      color: 'var(--mb-dark-text)',
                    }}
                  />
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="min-h-[52px] rounded-xl px-6 text-base font-bold lowercase disabled:opacity-60"
                    style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
                  >
                    {busy ? '…' : 'join'}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>
                  early flavors, the occasional treat, and crumbs once the rewards program lands.
                </p>
              </>
            )}
          </div>
        </div>

        <div
          className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t pt-8 text-base font-semibold lowercase"
          style={{ borderColor: 'var(--mb-dark-line)', color: 'var(--mb-dark-muted)' }}
        >
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
          <a href="https://burroship.com/rewards" target="_blank" rel="noopener noreferrer">rewards</a>
          <Link to="/admin/" className="ml-auto flex items-center gap-1.5">
            <ChefHat size={16} />
            back of house
          </Link>
        </div>
      </div>

      {/* ── THE SIGN OFF ─────────────────────────────────────────────────────
          The name, last thing on the page.

          IT WAS A BILLBOARD AND THAT WAS THE WRONG CALL. It ran at
          clamp(3rem, 15vw, 15rem), so 219px on a laptop, and the whole footer
          bent around it. The idea was a stamp on the side of a box. In practice
          a wordmark that size stops being a sign off and becomes the content,
          and everything above it, the counter line, the address, the list
          signup, reads as small print underneath a logo.

          It also never actually reached the rail, so it did not even read as
          deliberate. It read as text somebody set too large.

          The ceiling is 4.5rem, 72px, which is about the height of the two
          stacked lines beside it and sits in proportion to a footer roughly
          500px tall. Big enough to close the page, small enough that the
          content above it is still the point. Raising this is how it becomes a
          billboard again. */}
      <div className="mx-auto mt-12 w-[92%] max-w-[1680px]">
        <Link
          to="/"
          aria-label="madebutter. home"
          className="inline-block font-bold lowercase leading-[0.9]"
          style={{
            letterSpacing: 'var(--tracking-logo)',
            fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
          }}
        >
          madebutter<span style={{ color: 'var(--mb-accent-butter)' }}>.</span>
        </Link>
      </div>

      <div className="mx-auto w-[92%] max-w-[1680px]">
        <div
          className="mt-8 flex flex-col gap-2 border-t py-7 text-sm lowercase sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--mb-dark-line)', color: 'var(--mb-dark-muted)' }}
        >
          <span>© {new Date().getFullYear()} madebutter. a burroship brand.</span>
          <span>
            built by{' '}
            <a
              href="https://neonburro.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--mb-dark-text)', fontWeight: 600 }}
            >
              neonburro
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
