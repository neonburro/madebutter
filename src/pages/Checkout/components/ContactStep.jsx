// src/pages/Checkout/components/ContactStep.jsx
import { useState } from 'react';

export default function ContactStep({ value, onChange, onContinue }) {
  const [touched, setTouched] = useState(false);
  const { name, channel, phone, email, saveInfo } = value;

  const contactValid =
    (channel === 'sms' && phone.trim().length >= 10) ||
    (channel === 'email' && /\S+@\S+\.\S+/.test(email));
  const valid = name.trim().length > 0 && contactValid;
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-text-muted)' }}>
        Your details
      </h2>

      <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-secondary)' }}>Name</label>
      <input
        value={name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="First name"
        className="mb-4 w-full rounded-xl px-3 py-3 text-sm outline-none"
        style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
      />

      <div className="mb-3 flex gap-2">
        {['sms', 'email'].map((c) => {
          const active = channel === c;
          return (
            <button
              key={c}
              onClick={() => set({ channel: c })}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                border: `1px solid ${active ? 'var(--mb-text-primary)' : 'var(--mb-surface-line-strong)'}`,
                background: active ? 'var(--mb-text-primary)' : 'var(--mb-surface-base)',
                color: active ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)',
              }}
            >
              {c === 'sms' ? 'Text me' : 'Email me'}
            </button>
          );
        })}
      </div>

      {channel === 'sms' ? (
        <input
          value={phone}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="Phone number"
          inputMode="tel"
          className="w-full rounded-xl px-3 py-3 text-sm outline-none"
          style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
        />
      ) : (
        <input
          value={email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="Email address"
          inputMode="email"
          className="w-full rounded-xl px-3 py-3 text-sm outline-none"
          style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
        />
      )}

      <label className="mt-4 flex items-start gap-2.5 text-xs" style={{ color: 'var(--mb-text-secondary)' }}>
        <input
          type="checkbox"
          checked={saveInfo}
          onChange={(e) => set({ saveInfo: e.target.checked })}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#A8B89A]"
        />
        <span>Save my info so we can send your locker number and remember you next time. We'll only message you about your orders unless you opt into more.</span>
      </label>

      {touched && !valid && (
        <p className="mt-3 text-xs" style={{ color: 'var(--mb-accent-toast)' }}>
          Add your name and a {channel === 'sms' ? 'phone number' : 'valid email'} to continue.
        </p>
      )}

      <button
        onClick={() => (valid ? onContinue() : setTouched(true))}
        className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99]"
        style={{
          background: valid ? 'var(--mb-dark-base)' : 'var(--mb-surface-raised)',
          color: valid ? 'var(--mb-dark-text)' : 'var(--mb-text-muted)',
        }}
      >
        Continue to payment
      </button>
    </div>
  );
}
