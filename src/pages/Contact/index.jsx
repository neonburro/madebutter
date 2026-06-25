// src/pages/Contact/index.jsx
// Contact page. Funny "what are you inquiring about" picker, name, contact, message.
// Posts to the contact Netlify function which emails the shop. Logo links home.
// No back button. Clean voice, no em dashes, oxford commas or colons.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

const TOPICS = [
  'just saying hi',
  'a big order or catering',
  'something went sideways with my order',
  'i have a flavor idea you need to make',
  'wholesale or stocking madebutter',
  'press or collab',
  'i want to work here',
  'something else entirely',
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
        <Link to="/" aria-label="madebutter. home"><ButterMark size={72} /></Link>
        <h1 className="mt-6 text-2xl font-bold">Got it. Thanks {name.split(' ')[0]}.</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          We will get back to you soon. If it is urgent, give us a ring at (970) 696-7575.
        </p>
        <Link to="/" className="mt-8 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          Back to the good stuff
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <Link to="/" aria-label="madebutter. home"><ButterMark size={64} /></Link>
        <h1 className="mt-5 text-3xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Say hello</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          Questions, ideas, big orders, or just butter appreciation. We read all of it.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />

        <div>
          <label className="mb-1 block px-1 text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>what are you inquiring about</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field}>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="tell us everything" rows={5}
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />

        {error && <p className="text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'Sending…' : 'Send it'}
        </button>
      </div>

      <div className="mt-10 border-t pt-6 text-center text-sm" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-secondary)' }}>
        <p>100 Campbell Lane, Ridgway, CO 81432</p>
        <p className="mt-1">(970) 696-7575</p>
      </div>
    </main>
  );
}
