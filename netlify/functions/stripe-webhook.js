// netlify/functions/stripe-webhook.js
// Stripe calls this on payment_intent.succeeded. We verify the signature, find
// the PENDING order (written during create-payment-intent), flip it to 'paid',
// decrement inventory, and upsert the customer if they opted in.
import Stripe from 'stripe';
import { adminClient, json } from './_shared.js';

export const config = { bodyParser: false }; // need raw body for signature check

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
    let order = null;
    if (m.order_id) {
      const { data } = await db.from('orders').select('*').eq('id', m.order_id).single();
      order = data;
    }
    if (!order) {
      const { data } = await db.from('orders').select('*').eq('stripe_payment_intent_id', pi.id).single();
      order = data;
    }
    if (!order) {
      return json(200, { received: true, note: 'no matching order found' });
    }

    if (order.status !== 'pending') {
      return json(200, { received: true, already: order.status });
    }

    const { error: updErr } = await db
      .from('orders')
      .update({ status: 'paid', stripe_payment_intent_id: pi.id })
      .eq('id', order.id);
    if (updErr) throw updErr;

    const { data: orderItems } = await db
      .from('order_items')
      .select('item_id, qty')
      .eq('order_id', order.id);
    for (const li of orderItems || []) {
      if (li.item_id) {
        await db.rpc('decrement_stock', { p_item_id: li.item_id, p_qty: li.qty });
      }
    }

    if (m.save_info === 'true' && (order.contact_phone || order.contact_email)) {
      await db.from('customers').upsert(
        {
          name: order.contact_name || null,
          phone: order.contact_phone || null,
          email: order.contact_email || null,
        },
        { onConflict: order.contact_phone ? 'phone' : 'email' }
      );
    }

    // TODO: fire "order received" customer receipt + admin alert once Twilio/Resend wired.

    return json(200, { received: true, order_id: order.id, status: 'paid' });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
