// src/pages/Contact/index.jsx
// Coming soon vibe. Clean white, centered, big and bold. A soft status badge up top,
// a headline that reads like a countdown to open, and a low-key notify capture instead
// of a full inquiry form. Hours and phone still there so people can reach a human now.
// Footer is global. Logo links home, no back button.
// No em dashes, oxford commas or colons. Prototype.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const field = {
    border: '1px solid var(--mb-surface-line-strong)',
    background: 'var(--mb-surface-base)',
  };
  const valid = email.trim();

  const submit = async () => {
    if (!valid) { setError('Drop an email so we can ping you.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'notify list', contact: email, topic: 'coming soon notify', message: 'wants to know when we open' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send.');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <Link to="/" aria-label="madebutter. home"><ButterMark size={88} /></Link>

        <span
          className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase"
          style={{ letterSpacing: '0.14em', border: '1px solid var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--mb-accent-toast)' }} />
          almost buttered
        </span>

        <h1 className="mt-7 text-5xl font-bold sm:text-7xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
          Coming soon
        </h1>
        <p className="mt-5 max-w-lg text-lg font-semibold leading-relaxed sm:text-xl" style={{ color: 'var(--mb-text-secondary)' }}>
          We are putting the finishing touches on something good. Leave your email and you will be the first to know when the doors swing open.
        </p>

        {sent ? (
          <div className="mt-12 w-full rounded-2xl px-6 py-8" style={{ border: '1px solid var(--mb-surface-line-strong)' }}>
            <p className="text-2xl font-bold">You are on the list.</p>
            <p className="mt-3 text-base font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
              We will send one email when we open. No spam, no noise.
            </p>
          </div>
        ) : (
          <div className="mt-12 w-full space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              inputMode="email"
              className="w-full rounded-2xl px-4 py-4 text-center text-base font-medium outline-none"
              style={field}
            />
            {error && <p className="text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
            >
              {busy ? 'Adding you…' : 'Notify me'}
            </button>
          </div>
        )}

        <div className="mt-16 w-full border-t pt-10" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="text-sm font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'var(--mb-text-muted)' }}>need us sooner</p>
          <p className="mt-3 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>call or text anytime</p>
          <a href="tel:+19706967575" className="mt-1 block text-2xl font-bold">(970) 696-7575</a>
        </div>
      </main>
    </div>
  );
}