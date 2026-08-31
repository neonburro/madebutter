// src/pages/Checkout/components/CheckoutSummary.jsx
//
// What is in the box and what it costs, shown above the payment form. Subtotal,
// Ridgway tax and total, all computed through src/lib/tax.js so the number here
// is the number the server charges. If these ever disagree, the server is right
// and this file is the bug.
//
// The money column is tabular so the digits line up in a stack, which is the
// whole reason .mb-nums exists in src/index.css.
//
// Voice is lowercase, matching the cart sheet and the rest of checkout.
//
// No em dashes, oxford commas or colons.

import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/format';
import { describeOptions } from '../../../data/options';
import { withTax } from '../../../lib/tax';

export default function CheckoutSummary() {
  const { lines, subtotal } = useCart();
  const { tax, total } = withTax(subtotal);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}>
      <h2 className="mb-3 text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>
        your box
      </h2>
      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-4 text-sm">
            <span className="font-semibold">
              <span className="mb-nums">{l.qty}</span> × {l.name}
              {/* the add ons are part of what is being charged for, so they are
                  spelled out here even though the cart sheet keeps them small */}
              {l.options?.length > 0 && (
                <span className="block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>
                  {describeOptions(l.options)}
                </span>
              )}
            </span>
            <span className="mb-nums font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
              {formatPrice((l.unit_price ?? l.price ?? 0) * l.qty)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--mb-surface-line)' }}>
        <div className="flex justify-between text-sm font-semibold lowercase" style={{ color: 'var(--mb-text-secondary)' }}>
          <span>subtotal</span>
          <span className="mb-nums">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold lowercase" style={{ color: 'var(--mb-text-secondary)' }}>
          <span>tax</span>
          <span className="mb-nums">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between pt-1 text-lg font-bold lowercase">
          <span>total</span>
          <span className="mb-nums">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
