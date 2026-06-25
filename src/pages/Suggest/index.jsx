// src/pages/Suggest/index.jsx
// The suggestion box. Timestamped ideas so a hit can be credited to whoever called
// it first. Posts to the suggestion function. Logo links home, no back button.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

const SAGE_DEEP = '#3F4A3A';

export default function Suggest() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [idea, setIdea] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  const submit = async () => {
    if (!idea.trim()) { setError('Tell us the idea first.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, idea }),
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
        <Link to="/" aria-label="madebutter. home"><ButterMark size={84} /></Link>
        <h1 className="mt-6 text-2xl font-bold">Logged and timestamped.</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          Your idea is on the record. If it becomes a hit, we know it was yours and we will make it worth your while.
        </p>
        <Link to="/" className="mt-8 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          Back to the good stuff
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <Link to="/" aria-label="madebutter. home"><ButterMark size={84} /></Link>
        <h1 className="mt-5 text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Suggestion box</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
          Got a flavor or an idea we need to make? Drop it here. Every idea is timestamped, so if yours becomes a hit, the credit and the reward are yours.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="the idea. go wild." rows={5}
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name (so we can credit you)"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone (so we can reward you)"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />

        {error && <p className="text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'Logging…' : 'Drop it in the box'}
        </button>
        <p className="text-center text-xs" style={{ color: SAGE_DEEP }}>
          timestamped the moment you submit
        </p>
      </div>
    </main>
  );
}
