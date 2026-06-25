// src/pages/Contact/index.jsx
// Contact page. Desktop: two-panel (matcha info panel left, form right). Mobile:
// stacked. Topic is tappable pills, not a dropdown. Six topics incl Suggestion Box,
// which nudges to the dedicated suggestion page. Hours, address, phone. Logo links
// home, no back button. Clean voice, no em dashes, oxford commas or colons.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

const SAGE = '#A8B89A';
const SAGE_DEEP = '#3F4A3A';
const INK = '#161412';

const TOPICS = [
  'just saying hi',
  'a big order or catering',
  'something went sideways',
  'i have a business idea',
  'i want in on what you are building',
  'suggestion box',
];

export default function Contact() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };
  const valid = name.trim() && contact.trim() && message.trim();
  const isSuggestion = topic === 'suggestion box';

  const submit = async () => {
    if (!valid) { setError('Add your name, a way to reach you and a message.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, topic, message }),
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
        <h1 className="mt-6 text-2xl font-bold">Got it. Thanks {name.split(' ')[0]}.</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          We will get back to you soon. If it is urgent, ring us at (970) 696-7575.
        </p>
        <Link to="/" className="mt-8 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          Back to the good stuff
        </Link>
      </main>
    );
  }

  const InfoPanel = (
    <div className="flex flex-col">
      <Link to="/" aria-label="madebutter. home"><ButterMark size={84} /></Link>
      <h1 className="mt-6 text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)', color: INK }}>Say hello</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: SAGE_DEEP }}>
        Questions, ideas, big orders, or just butter appreciation. We read all of it.
      </p>

      <div className="mt-8 space-y-4 text-sm" style={{ color: INK }}>
        <div>
          <p className="text-xs font-semibold uppercase" style={{ letterSpacing: '0.1em', color: SAGE_DEEP }}>hours</p>
          <p className="mt-1 font-medium">every day, 6am to 9pm</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase" style={{ letterSpacing: '0.1em', color: SAGE_DEEP }}>find us</p>
          <p className="mt-1 font-medium">100 Campbell Lane, Ridgway, CO 81432</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase" style={{ letterSpacing: '0.1em', color: SAGE_DEEP }}>call</p>
          <a href="tel:+19706967575" className="mt-1 block font-medium">(970) 696-7575</a>
        </div>
      </div>
    </div>
  );

  const Form = (
    <div>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />

        <div>
          <p className="mb-2 px-1 text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>what are you inquiring about</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="rounded-full px-3.5 py-2 text-xs font-medium transition-colors"
                  style={{
                    border: `1px solid ${active ? INK : 'var(--mb-surface-line-strong)'}`,
                    background: active ? INK : 'var(--mb-surface-base)',
                    color: active ? '#fff' : 'var(--mb-text-secondary)',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {isSuggestion && (
          <div className="rounded-2xl p-4 text-xs leading-relaxed" style={{ background: `${SAGE}22`, color: SAGE_DEEP }}>
            Quick heads up. Real flavor ideas belong in the{' '}
            <Link to="/suggest/" className="font-semibold underline" style={{ color: INK }}>suggestion box</Link>.
            It timestamps your idea so if it becomes a hit, we know it was yours and we reward you the madebutter way.
          </div>
        )}

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="tell us everything" rows={5}
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />

        {error && <p className="text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'Sending…' : 'Send it'}
        </button>
      </div>
    </div>
  );

  return (
    <main className="w-full">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-0 lg:min-h-[80vh] lg:grid-cols-2">
        <div className="px-6 py-12 lg:px-12 lg:py-16" style={{ background: SAGE }}>
          {InfoPanel}
        </div>
        <div className="px-6 py-12 lg:px-12 lg:py-16">
          {Form}
        </div>
      </div>
    </main>
  );
}
