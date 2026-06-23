// netlify/functions/create-payment-intent.js
// Recomputes totals from the DB (never trusts client prices), creates a PaymentIntent.
import Stripe from 'stripe';
import { adminClient, json } from './_shared.js';

const TAX_RATE = 0; // prices are tax-included per pricing sheet

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const db = adminClient();

  try {
    const { cart, contact } = JSON.parse(event.body || '{}');
    if (!Array.isArray(cart) || cart.length === 0) {
      return json(400, { error: 'Cart is empty' });
    }

    const slugs = cart.map((c) => c.slug);
    const { data: items, error } = await db
      .from('items')
      .select('id, slug, name, price, is_active, is_available_today')
      .in('slug', slugs);

    if (error) throw error;

    let subtotal = 0;
    const lineItems = [];
    for (const c of cart) {
      const dbItem = items.find((i) => i.slug === c.slug);
      if (!dbItem || !dbItem.is_active || !dbItem.is_available_today) {
        return json(400, { error: `Item unavailable: ${c.slug}` });
      }
      const qty = Math.max(1, parseInt(c.qty, 10) || 1);
      const lineTotal = dbItem.price * qty;
      subtotal += lineTotal;
      lineItems.push({
        item_id: dbItem.id,
        item_slug: dbItem.slug,
        item_name: dbItem.name,
        unit_price_cents: dbItem.price,
        qty,
        line_total_cents: lineTotal,
      });
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;
    if (total <= 0) return json(400, { error: 'Order total must be greater than zero' });

    const intent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        contact_name: contact?.name || '',
        contact_phone: contact?.phone || '',
        contact_email: contact?.email || '',
        preferred_channel: contact?.channel || 'sms',
        line_items: JSON.stringify(lineItems).slice(0, 4900),
        subtotal_cents: String(subtotal),
        tax_cents: String(tax),
        total_cents: String(total),
      },
    });

    return json(200, { clientSecret: intent.client_secret, subtotal, tax, total });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
