// src/pages/Suggest/index.jsx
// Suggestion box. True full-width 50/50 on desktop (image left, content right),
// stacked on mobile and iPad. Naked background, no cream containers. Matcha bullets,
// big readable text, everything semibold or heavier. Email mandatory, phone optional.
// Timestamped ideas so a hit can be credited to whoever called it first. Footer is
// global. Logo links home. No em dashes, oxford commas or colons.
//
// IMAGE: drop a big studio image at public/suggest/suggestion-box.png and it fills
// the left panel. Until then a clean placeholder surface shows.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

const SAGE = '#A8B89A';

const EXAMPLES = [
  'a flavor you wish existed',
  'a kolache filling we have to try',
  'a coffee pairing for a specific donut',
  'a seasonal drop idea',
  'something weird that just might work',
  'bring back something we used to make',
];

export default function Suggest() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idea, setIdea] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const field = {
    border: '1px solid var(--mb-surface-line-strong)',
    background: 'var(--mb-surface-base)',
  };

  const submit = async () => {
    if (!idea.trim()) { setError('Tell us the idea first.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact: email + (phone ? ` / ${phone}` : ''), idea }),
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

  if (sent) {
    return (
      <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <Link to="/" aria-label="madebutter. home"><ButterMark size={88} /></Link>
        <h1 className="mt-8 text-4xl font-bold">Logged and timestamped.</h1>
        <p className="mt-4 text-lg font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
          Your idea is on the record. If it becomes a hit, we know it was yours and we will make it worth your while.
        </p>
        <Link to="/" className="mt-8 rounded-full px-7 py-3.5 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          Back to the good stuff
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <div className="grid grid-cols-1 lg:min-h-[88vh] lg:grid-cols-2">
        <div className="order-1 px-6 pt-10 lg:order-1 lg:p-0">
          <div className="aspect-square w-full overflow-hidden rounded-3xl lg:h-full lg:rounded-none">
            <img
              src="/suggest/suggestion-box.png"
              alt="madebutter suggestion box"
              className="h-full w-full object-cover"
              style={{ background: 'var(--mb-surface-paper)' }}
              onError={(e) => { e.currentTarget.style.opacity = '0'; }}
            />
          </div>
        </div>

        <div className="order-2 flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-16">
          <Link to="/" aria-label="madebutter. home"><ButterMark size={76} /></Link>
          <h1 className="mt-6 text-5xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>
            Suggestion box
          </h1>
          <p className="mt-5 text-lg font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
            Got a flavor or an idea we need to make? Drop it here. Every idea is timestamped, so if yours becomes a hit, the credit and the reward are yours.
          </p>

          <div className="mt-10">
            <p className="text-sm font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'var(--mb-text-muted)' }}>how to suggest</p>
            <ul className="mt-4 space-y-3">
              {EXAMPLES.map((e) => (
                <li key={e} className="flex items-start gap-3 text-lg font-semibold" style={{ color: 'var(--mb-text-primary)' }}>
                  <span className="text-xl leading-tight" style={{ color: SAGE }}>•</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-4">
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="the idea. go wild." rows={5}
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name (so we can credit you)"
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" inputMode="email"
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="phone (optional but recommended)" inputMode="tel"
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
            <p className="px-1 text-sm font-medium" style={{ color: 'var(--mb-text-muted)' }}>
              email so we can reach you. phone is optional and you can unsubscribe anytime if it is too much.
            </p>

            {error && <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

            <button onClick={submit} disabled={busy}
              className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
              {busy ? 'Logging…' : 'Drop it in the box'}
            </button>
            <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
              timestamped the moment you submit
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
