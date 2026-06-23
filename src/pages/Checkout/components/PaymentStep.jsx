// src/pages/Checkout/components/PaymentStep.jsx
// Branded Stripe checkout. Express Checkout (Apple Pay / Google Pay / saved cards)
// sits on top for instant payment; the card Payment Element is below for everyone else.
// Server recomputes totals; on success we clear the cart and route to confirmation.
import { useEffect, useState } from 'react';
import {
  Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { getStripe, stripeAppearance } from '../../../lib/stripe';
import { useCart } from '../../../context/CartContext';

function InnerForm({ onBack, contact }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasExpress, setHasExpress] = useState(false);

  const finish = (paymentIntent) => {
    clear();
    navigate(`/order/${paymentIntent.id}/`, { state: { channel: contact.channel } });
  };

  const onExpressConfirm = async () => {
    if (!stripe || !elements) return;
    const { error: payErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (payErr) { setError(payErr.message); return; }
    if (paymentIntent && paymentIntent.status === 'succeeded') finish(paymentIntent);
  };

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: payErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (payErr) { setError(payErr.message); setSubmitting(false); return; }
    if (paymentIntent && paymentIntent.status === 'succeeded') finish(paymentIntent);
    else setSubmitting(false);
  };

  return (
    <div>
      <div className={hasExpress ? 'mb-5' : ''}>
        <ExpressCheckoutElement
          onConfirm={onExpressConfirm}
          onReady={(e) => setHasExpress(!!(e.availablePaymentMethods))}
        />
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
      <button onClick={onBack} className="mt-2 w-full py-2 text-xs" style={{ color: 'var(--mb-text-muted)' }}>
        Back to details
      </button>
    </div>
  );
}

export default function PaymentStep({ contact, onBack }) {
  const { lines } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: lines.map((l) => ({ slug: l.slug || l.id, qty: l.qty })),
            contact: {
              name: contact.name,
              phone: contact.channel === 'sms' ? contact.phone : '',
              email: contact.channel === 'email' ? contact.email : '',
              channel: contact.channel,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not start payment');
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
      }
    }
    init();
  }, [lines, contact]);

  if (error) {
    return (
      <div>
        <p className="text-sm" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>
        <button onClick={onBack} className="mt-4 text-xs" style={{ color: 'var(--mb-text-muted)' }}>Back to details</button>
      </div>
    );
  }

  if (!clientSecret) {
    return <p className="py-8 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>Preparing secure checkout…</p>;
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance: stripeAppearance }}>
      <InnerForm onBack={onBack} contact={contact} />
    </Elements>
  );
}
