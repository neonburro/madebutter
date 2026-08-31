// src/pages/Contact/index.jsx
// Clean white contact page, centered. Big bold readable vibe matching the suggestion
// page. No hero. Pills for topic, email required, phone optional but recommended.
// Sends email and phone as SEPARATE fields so the function can set a clean reply_to.
// Footer is global. Logo links home, no back button.
//
// The status pill says TEST KITCHEN, not coming soon. It is true today, it
// stays true after the doors open, and it says something about what this place
// is instead of asking to be judged later. Coming soon is a promise in nobody's
// voice and it goes stale the day somebody forgets to delete it.
// No em dashes, oxford commas or colons.
// Last updated 2026-07-27.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Kolache from '../../components/Kolache/Kolache';
import { SAYS } from '../../data/kolache';
import ButterMark from '../../components/Brand/ButterMark';

const TOPICS = [
  'just saying hi',
  'a big order or catering',
  'something went sideways',
  'i have a business idea',
  'i want in on what you are building',
  'suggestion box',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };
  const emailValid = EMAIL_RE.test(email.trim());
  const valid = name.trim() && emailValid && message.trim();
  const isSuggestion = topic === 'suggestion box';

  const submit = async () => {
    if (!name.trim()) { setError('Add your name so we know who we are talking to.'); return; }
    if (!emailValid) { setError('Add a valid email so we can reach you.'); return; }
    if (!message.trim()) { setError('Tell us what is on your mind.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), topic, message: message.trim() }),
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
      <main className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <Link to="/" aria-label="madebutter. home"><ButterMark size={92} /></Link>
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">Got it. Thanks {name.split(' ')[0]}.</h1>
            <p className="mt-5 max-w-md text-lg font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
              We sent a note to your email and we will get back to you soon. If it is urgent, call or text us at (970) 696-7575.
            </p>
            <Link to="/" className="mt-8 rounded-full px-7 py-3.5 text-base font-bold transition-transform active:scale-[0.99]" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
              Back to the good stuff
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <Link to="/" aria-label="madebutter. home"><ButterMark size={84} /></Link>
              <span className="mt-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', border: '1px solid var(--mb-surface-line)', color: 'var(--mb-text-muted)' }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--mb-accent-toast)' }} />
                test kitchen
              </span>
              <h1 className="mt-5 text-5xl font-bold sm:text-6xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>Say hello</h1>
              <p className="mt-5 max-w-lg text-lg font-semibold leading-relaxed sm:text-xl" style={{ color: 'var(--mb-text-secondary)' }}>
                No storefront yet. The kitchen is real and it is busy. Questions, ideas, big orders, or just butter appreciation, send them over and we read every one.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name"
                className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none transition-colors focus:border-[var(--mb-text-primary)]" style={field} />

              <div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" inputMode="email" autoCapitalize="none"
                  className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none transition-colors focus:border-[var(--mb-text-primary)]"
                  style={{ ...field, borderColor: email && !emailValid ? 'var(--mb-accent-toast)' : 'var(--mb-surface-line-strong)' }} />
                {email && !emailValid && (
                  <p className="mt-1.5 px-1 text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>That email does not look right yet.</p>
                )}
              </div>

              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="phone (optional but recommended)" inputMode="tel"
                className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none transition-colors focus:border-[var(--mb-text-primary)]" style={field} />
              <p className="px-1 text-sm font-medium leading-relaxed" style={{ color: 'var(--mb-text-muted)' }}>
                one email so we can reach you. phone is optional and you can unsubscribe anytime if it is too much.
              </p>

              <div className="pt-2">
                <p className="mb-3 px-1 text-base font-semibold" style={{ color: 'var(--mb-text-primary)' }}>what are you inquiring about</p>
                <div className="flex flex-wrap gap-2.5">
                  {TOPICS.map((t) => {
                    const active = topic === t;
                    return (
                      <button key={t} onClick={() => setTopic(t)}
                        className="rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
                        style={{
                          border: `1px solid ${active ? 'var(--mb-text-primary)' : 'var(--mb-surface-line-strong)'}`,
                          background: active ? 'var(--mb-text-primary)' : 'var(--mb-surface-base)',
                          color: active ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)',
                        }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isSuggestion && (
                <div className="rounded-2xl px-4 py-4 text-base font-semibold leading-relaxed" style={{ border: '1px solid var(--mb-surface-line)', color: 'var(--mb-text-secondary)' }}>
                  Quick heads up. Real flavor ideas belong in the{' '}
                  <Link to="/suggest/" className="underline" style={{ color: 'var(--mb-text-primary)' }}>suggestion box</Link>.
                  It timestamps your idea so if it becomes a hit, we know it was yours and we reward you the madebutter way.
                </div>
              )}

              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="tell us everything" rows={5}
                className="w-full rounded-2xl px-4 py-4 text-base font-medium leading-relaxed outline-none transition-colors focus:border-[var(--mb-text-primary)]" style={field} />

              {error && <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

              <button onClick={submit} disabled={busy || !valid}
                className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-50"
                style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
                {busy ? 'Sending…' : 'Send it'}
              </button>
            </div>

            {/* There are no hours because there is no room to have hours in.
                Printing a label with "coming soon" under it is worse than not
                printing the label: it draws attention to the missing thing.
                What is true is that a phone gets answered, so that is what
                this block is now. */}
            <div className="mt-14 border-t pt-10 text-center" style={{ borderColor: 'var(--mb-surface-line)' }}>
              <p className="text-sm font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'var(--mb-text-muted)' }}>
                call or text
              </p>
              <a href="tel:+19706967575" className="mt-2 block text-2xl font-bold">(970) 696-7575</a>
              <div className="mt-8 flex justify-center">
                <Kolache say={SAYS.notOpenYet} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
