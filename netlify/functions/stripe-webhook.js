// netlify/functions/stripe-webhook.js
// On payment_intent.succeeded: upsert customer, write order + items, status 'paid'.
// No locker yet — staff assigns manually, then notify-order fires.
import Stripe from 'stripe';
import { adminClient, json, shortCode } from './_shared.js';

export const config = { bodyParser: false };

export async function handler(event) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = event.headers['stripe-signature'];
  let evt;

  try {
    evt = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return json(400, { error: `Webhook signature failed: ${err.message}` });
  }

  if (evt.type !== 'payment_intent.succeeded') {
    return json(200, { received: true, ignored: evt.type });
  }

  const pi = evt.data.object;
  const m = pi.metadata || {};
  const db = adminClient();

  try {
    let customerId = null;
    const phone = m.contact_phone || null;
    const email = m.contact_email || null;
    if (phone || email) {
      const { data: cust } = await db
        .from('customers')
        .upsert(
          {
            name: m.contact_name || null,
            phone,
            email,
            sms_opt_in: m.sms_opt_in === 'true',
            email_opt_in: m.email_opt_in === 'true',
          },
          { onConflict: phone ? 'phone' : 'email' }
        )
        .select('id')
        .single();
      customerId = cust?.id || null;
    }

    const lineItems = JSON.parse(m.line_items || '[]');

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        short_code: shortCode(),
        customer_id: customerId,
        contact_name: m.contact_name || null,
        contact_phone: phone,
        contact_email: email,
        preferred_channel: m.preferred_channel || 'sms',
        status: 'paid',
        subtotal_cents: parseInt(m.subtotal_cents, 10) || 0,
        tax_cents: parseInt(m.tax_cents, 10) || 0,
        total_cents: parseInt(m.total_cents, 10) || 0,
        stripe_payment_intent_id: pi.id,
      })
      .select('id, short_code')
      .single();

    if (orderErr) throw orderErr;

    if (lineItems.length) {
      const rows = lineItems.map((li) => ({ ...li, order_id: order.id }));
      const { error: itemsErr } = await db.from('order_items').insert(rows);
      if (itemsErr) throw itemsErr;
    }

    return json(200, { received: true, order_id: order.id, short_code: order.short_code });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
