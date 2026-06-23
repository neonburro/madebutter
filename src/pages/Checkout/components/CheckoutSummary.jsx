// src/pages/Checkout/components/CheckoutSummary.jsx
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/format';

export default function CheckoutSummary() {
  const { lines, subtotal } = useCart();
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
      <div className="mt-4 flex justify-between border-t pt-3 font-semibold" style={{ borderColor: 'var(--mb-surface-line)' }}>
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
