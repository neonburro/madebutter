// src/pages/Checkout/index.jsx
// Single-screen checkout: order summary, details, then pay. No separate steps.
// Guest-first. Optional unchecked opt-in to save info for rewards + faster checkout.
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Wordmark from '../../components/Brand/Wordmark';
import ButterMark from '../../components/Brand/ButterMark';
import Kolache from '../../components/Kolache/Kolache';
import { SAYS } from '../../data/kolache';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutFlow from './components/CheckoutFlow';

export default function Checkout() {
  const { count } = useCart();

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/" className="text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>← back to menu</Link>
      <div className="mt-6 mb-8 flex items-center gap-2.5">
        <ButterMark size={32} />
        <Wordmark className="text-2xl" />
      </div>

      {count === 0 ? (
        // the counter answers, same as the cart sheet. see src/data/kolache.js
        <Kolache size="lg" say={SAYS.emptyCart} />
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
