// src/pages/Checkout/components/PaymentStep.jsx
import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: payErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (payErr) {
      setError(payErr.message);
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      clear();
      navigate(`/order/${paymentIntent.id}/`, { state: { channel: contact.channel } });
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div>
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
