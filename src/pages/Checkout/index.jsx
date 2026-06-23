// src/pages/Checkout/index.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Wordmark from '../../components/Brand/Wordmark';
import CheckoutSummary from './components/CheckoutSummary';
import ContactStep from './components/ContactStep';
import PaymentStep from './components/PaymentStep';

export default function Checkout() {
  const { count } = useCart();
  const [step, setStep] = useState('contact');
  const [contact, setContact] = useState({
    name: '', channel: 'sms', phone: '', email: '', saveInfo: true,
  });

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-10">
      <Link to="/" className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>← back to menu</Link>
      <div className="mt-6 mb-8"><Wordmark className="text-2xl" /></div>

      {count === 0 ? (
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>Your cart is empty.</p>
      ) : (
        <>
          <CheckoutSummary />
          <div className="mt-6">
            {step === 'contact' ? (
              <ContactStep value={contact} onChange={setContact} onContinue={() => setStep('payment')} />
            ) : (
              <PaymentStep contact={contact} onBack={() => setStep('contact')} />
            )}
          </div>
        </>
      )}
    </main>
  );
}
