// src/pages/Checkout/components/CheckoutSummary.jsx
// Order summary shown before payment. Subtotal, Ridgway tax, and total, using the
// shared tax config so what the customer sees here matches what the server charges.
// Last updated 2026-06-27.
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/format';
import { withTax } from '../../../lib/tax';

export default function CheckoutSummary() {
  const { lines, subtotal } = useCart();
  const { tax, total } = withTax(subtotal);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--mb-surface-paper)' }}>
      <h2 className="mb-3 text-sm font-medium uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-text-muted)' }}>
        Order summary
      </h2>
      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l.id} className="flex justify-between text-sm">
            <span>{l.qty} × {l.name}</span>
            <span style={{ color: 'var(--mb-text-secondary)' }}>{formatPrice((l.price || 0) * l.qty)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--mb-surface-line)' }}>
        <div className="flex justify-between text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between pt-1 text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
