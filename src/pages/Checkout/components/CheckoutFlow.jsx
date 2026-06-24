// src/pages/Checkout/components/CheckoutFlow.jsx
// One-screen checkout. Details on top; once valid, the payment intent is created
// and the Stripe payment surface (express wallets + card) reveals below.
// Opt-in to save info is UNCHECKED by default. Guest-first, no account required.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { getStripe, stripeAppearance } from '../../../lib/stripe';
import { useCart } from '../../../context/CartContext';
import ButterMark from '../../../components/Brand/ButterMark';

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
    if (!stripe || !elements) return;
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
          <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>or pay with card</span>
          <span className="h-px flex-1" style={{ background: 'var(--mb-surface-line)' }} />
        </div>
      )}
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="mt-3 text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
      <button
        onClick={pay}
        disabled={!stripe || submitting}
        className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
        style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
      >
        {submitting ? 'Processing…' : 'Pay now'}
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
          cart: lines.map((l) => ({ slug: l.slug || l.id, qty: l.qty })),
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
          s.available > 0 ? `${s.name}: only ${s.available} left` : `${s.name}: sold out`
        );
        setError(`Some items just changed. ${msgs.join('. ')}. Please head back and adjust your cart.`);
        setStarting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not start payment');
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  const fieldStyle = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-text-muted)' }}>
        Checkout
      </h2>

      <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-secondary)' }}>Name</label>
      <input
        value={name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="First name"
        className="mb-4 w-full rounded-xl px-3 py-3 text-sm outline-none"
        style={fieldStyle}
      />

      <div className="mb-3 flex gap-2">
        {['sms', 'email'].map((c) => {
          const active = channel === c;
          return (
            <button
              key={c}
              onClick={() => set({ channel: c })}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
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
        <input value={phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Phone number" inputMode="tel"
          className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={fieldStyle} />
      ) : (
        <input value={email} onChange={(e) => set({ email: e.target.value })} placeholder="Email address" inputMode="email"
          className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={fieldStyle} />
      )}

      <label
        className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 text-xs transition-colors"
        style={{ border: '1px solid var(--mb-surface-line-strong)', background: saveInfo ? 'rgba(168,184,154,0.10)' : 'var(--mb-surface-base)', color: 'var(--mb-text-secondary)' }}
      >
        <input
          type="checkbox"
          checked={saveInfo}
          onChange={(e) => set({ saveInfo: e.target.checked })}
          className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#A8B89A]"
        />
        <span className="leading-relaxed">
          Save my info for rewards and faster checkout next time. We'll only message you about your orders. See our{' '}
          <Link to="/terms/" className="underline" onClick={(e) => e.stopPropagation()}>terms</Link> and{' '}
          <Link to="/privacy/" className="underline" onClick={(e) => e.stopPropagation()}>privacy policy</Link>.
        </span>
      </label>

      {touched && !valid && (
        <p className="mt-3 text-xs" style={{ color: 'var(--mb-accent-toast)' }}>
          Add your name and a {channel === 'sms' ? 'phone number' : 'valid email'} to continue.
        </p>
      )}
      {error && <p className="mt-3 text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

      {!clientSecret ? (
        starting ? (
          <div className="mt-6 flex flex-col items-center justify-center py-6">
            <ButterMark size={52} animate />
            <p className="mt-4 text-sm" style={{ color: 'var(--mb-text-muted)' }}>warming up your checkout…</p>
          </div>
        ) : (
          <button
            onClick={startPayment}
            className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99]"
            style={{
              background: valid ? 'var(--mb-dark-base)' : 'var(--mb-surface-raised)',
              color: valid ? 'var(--mb-dark-text)' : 'var(--mb-text-muted)',
            }}
          >
            Continue to payment
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
