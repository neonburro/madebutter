// src/pages/Checkout/index.jsx
// Single-screen checkout: order summary, details, then pay. No separate steps.
// Guest-first. Optional unchecked opt-in to save info for rewards + faster checkout.
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Wordmark from '../../components/Brand/Wordmark';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutFlow from './components/CheckoutFlow';

export default function Checkout() {
  const { count } = useCart();

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
            <CheckoutFlow />
          </div>
        </>
      )}
    </main>
  );
}
