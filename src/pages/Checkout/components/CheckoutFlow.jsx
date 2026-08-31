// src/pages/Checkout/components/CheckoutFlow.jsx
//
// One screen checkout. Details at the top, and once they are valid the payment
// intent is created and the Stripe surface reveals below with the express
// wallets first. Guest first, no account needed, and the save my info box is
// UNCHECKED by default and stays that way.
//
// ── THE INACTIVE BUTTON HAS TO BE VISIBLE ───────────────────────────────────
// It used to fall back to --mb-surface-raised while waiting for a valid name
// and number. That token became WHITE when the palette inverted and the page
// ground became warm paper, so the most important control on the site turned
// into a white pill on off white with muted text on it. It uses the sunk
// surface now, which is the well colour and is meant to read as a hole rather
// than as a card. Anything that needs to look inactive on this site wants sunk,
// never raised.
//
// It stays CLICKABLE while inactive on purpose. Pressing it is what reveals
// which field is missing, and a truly disabled button answers a person's tap
// with nothing at all.
//
// ── THE YELLOW IS THE COMMITMENT ────────────────────────────────────────────
// Butter marks the thing you press, which is why the cart sheet's checkout
// button wears it. This is the same action one screen later, so it matches. If
// these two ever disagree again, the cart is the reference.
//
// No em dashes, oxford commas or colons.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { getStripe, stripeAppearance } from '../../../lib/stripe';
import { useCart } from '../../../context/CartContext';
import ButterMark from '../../../components/Brand/ButterMark';

const PRIMARY = {
  background: 'var(--mb-accent-butter)',
  color: 'var(--mb-text-primary)',
  boxShadow: 'var(--mb-shadow-card)',
};

function PayInner({ contact }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasExpress, setHasExpress] = useState(false);

  const finish = (pi) => {
    clear();
    navigate(`/order/${pi.id}/`, { state: { channel: contact.channel } });
  };

  const confirm = async () => {
    if (!stripe || !elements) return false;
    const { error: payErr, paymentIntent } = await stripe.confirmPayment({
      elements, redirect: 'if_required',
    });
    if (payErr) { setError(payErr.message); return false; }
    if (paymentIntent && paymentIntent.status === 'succeeded') { finish(paymentIntent); return true; }
    return false;
  };

  const pay = async () => {
    setSubmitting(true);
    setError(null);
    const ok = await confirm();
    if (!ok) setSubmitting(false);
  };

  return (
    <div className="mt-6">
      <div className={hasExpress ? 'mb-5' : ''}>
        <ExpressCheckoutElement onConfirm={confirm} onReady={(e) => setHasExpress(!!e.availablePaymentMethods)} />
      </div>
      {hasExpress && (
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: 'var(--mb-surface-line)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>or pay with card</span>
          <span className="h-px flex-1" style={{ background: 'var(--mb-surface-line)' }} />
        </div>
      )}
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
      <button
        onClick={pay}
        disabled={!stripe || submitting}
        className="mt-5 w-full rounded-full py-4 text-base font-bold lowercase transition-transform active:scale-[0.99] disabled:opacity-60"
        style={PRIMARY}
      >
        {submitting ? 'processing…' : 'pay now'}
      </button>
    </div>
  );
}

export default function CheckoutFlow() {
  const { lines } = useCart();
  const [contact, setContact] = useState({ name: '', channel: 'sms', phone: '', email: '', saveInfo: false });
  const [touched, setTouched] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const { name, channel, phone, email, saveInfo } = contact;
  const contactValid =
    (channel === 'sms' && phone.trim().length >= 10) ||
    (channel === 'email' && /\S+@\S+\.\S+/.test(email));
  const valid = name.trim().length > 0 && contactValid;
  const set = (patch) => setContact((c) => ({ ...c, ...patch }));

  async function startPayment() {
    if (!valid) { setTouched(true); return; }
    if (clientSecret || starting) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // ids only. every name and price is re-derived server side, see the
          // add ons note in netlify/functions/create-payment-intent.js
          cart: lines.map((l) => ({
            slug: l.slug || l.id,
            qty: l.qty,
            options: (l.options || []).map((o) => o.id),
          })),
          contact: {
            name,
            phone: channel === 'sms' ? phone : '',
            email: channel === 'email' ? email : '',
            channel,
            saveInfo,
          },
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'stock_changed') {
        const msgs = (data.shortfalls || []).map((s) =>
          s.available > 0 ? `${s.name}, only ${s.available} left` : `${s.name}, sold out`
        );
        setError(`some of that just changed. ${msgs.join('. ')}. head back and adjust your box.`);
        setStarting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'could not start payment');
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  const fieldStyle = {
    border: '1px solid var(--mb-surface-line-strong)',
    background: 'var(--mb-surface-raised)',
  };

  return (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>
        checkout
      </h2>

      <label className="mb-1 block text-xs font-bold lowercase" style={{ color: 'var(--mb-text-secondary)' }}>name</label>
      <input
        value={name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="first name"
        className="mb-4 w-full rounded-xl px-3.5 py-3 text-sm font-semibold outline-none"
        style={fieldStyle}
      />

      <div className="mb-3 flex gap-2">
        {['sms', 'email'].map((c) => {
          const active = channel === c;
          return (
            <button
              key={c}
              onClick={() => set({ channel: c })}
              className="flex-1 rounded-xl py-3 text-sm font-bold lowercase transition-colors"
              style={{
                border: `1px solid ${active ? 'var(--mb-text-primary)' : 'var(--mb-surface-line-strong)'}`,
                background: active ? 'var(--mb-text-primary)' : 'var(--mb-surface-raised)',
                color: active ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)',
              }}
            >
              {c === 'sms' ? 'text me' : 'email me'}
            </button>
          );
        })}
      </div>

      {channel === 'sms' ? (
        <input value={phone} onChange={(e) => set({ phone: e.target.value })} placeholder="phone number" inputMode="tel"
          className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold outline-none" style={fieldStyle} />
      ) : (
        <input value={email} onChange={(e) => set({ email: e.target.value })} placeholder="email address" inputMode="email"
          className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold outline-none" style={fieldStyle} />
      )}

      <label
        className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 text-xs transition-colors"
        style={{
          border: '1px solid var(--mb-surface-line-strong)',
          background: saveInfo ? 'var(--mb-accent-butter-soft)' : 'var(--mb-surface-raised)',
          color: 'var(--mb-text-secondary)',
        }}
      >
        <input
          type="checkbox"
          checked={saveInfo}
          onChange={(e) => set({ saveInfo: e.target.checked })}
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ accentColor: 'var(--mb-accent-toast)' }}
        />
        <span className="leading-relaxed">
          save my info for rewards and a faster checkout next time. we only message you about your orders. see our{' '}
          <Link to="/terms/" className="underline" onClick={(e) => e.stopPropagation()}>terms</Link> and{' '}
          <Link to="/privacy/" className="underline" onClick={(e) => e.stopPropagation()}>privacy policy</Link>.
        </span>
      </label>

      {touched && !valid && (
        <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>
          add your name and a {channel === 'sms' ? 'phone number' : 'valid email'} to keep going.
        </p>
      )}
      {error && <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

      {!clientSecret ? (
        starting ? (
          <div className="mt-6 flex flex-col items-center justify-center py-6">
            <ButterMark size={52} animate />
            <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>warming up your checkout…</p>
          </div>
        ) : (
          <button
            onClick={startPayment}
            className="mt-5 w-full rounded-full py-4 text-base font-bold lowercase transition-transform active:scale-[0.99]"
            style={valid ? PRIMARY : { background: 'var(--mb-surface-sunk)', color: 'var(--mb-text-secondary)' }}
          >
            continue to payment
          </button>
        )
      ) : (
        <Elements stripe={getStripe()} options={{ clientSecret, appearance: stripeAppearance }}>
          <PayInner contact={contact} />
        </Elements>
      )}
    </div>
  );
}
