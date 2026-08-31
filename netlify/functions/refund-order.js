// netlify/functions/refund-order.js
// Issues a FULL refund on an order through Stripe, then mirrors the result in our DB.
// STAFF ONLY. Requires a paid order with a payment intent, refuses to double-refund,
// records the Stripe refund id and amount. Stripe is the source of truth for money.
// Last updated 2026-06-27.
import Stripe from 'stripe';
import { adminClient, json, requireStaff } from './_shared.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // STAFF ONLY. Without this, anyone holding an order id could issue
  // themselves a full Stripe refund by POSTing to this URL. It was reachable
  // by curl from the open internet and the only thing in front of it was the
  // admin screen, which is not a permission. See requireStaff in _shared.js.
  const gate = await requireStaff(event);
  if (gate.error) return gate.error;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const db = adminClient();

  try {
    const { order_id } = JSON.parse(event.body || '{}');
    if (!order_id) return json(400, { error: 'order_id required' });

    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return json(404, { error: 'Order not found' });

    if (order.status === 'refunded' || order.refunded_at) {
      return json(409, { error: 'This order was already refunded.' });
    }
    if (!order.stripe_payment_intent_id) {
      return json(400, { error: 'No Stripe payment on this order to refund.' });
    }
    if (!['paid', 'preparing', 'ready', 'picked_up'].includes(order.status)) {
      return json(400, { error: `Cannot refund an order that is ${order.status}.` });
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
    });

    const { error: updErr } = await db.from('orders').update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refund_amount_cents: refund.amount ?? order.total_cents ?? null,
      stripe_refund_id: refund.id,
    }).eq('id', order.id);
    if (updErr) throw updErr;

    try {
      await db.from('order_activity').insert({
        order_id: order.id,
        action: 'refunded',
        from_status: order.status,
        to_status: 'refunded',
        detail: `refunded $${((refund.amount ?? 0) / 100).toFixed(2)}`,
      });
    } catch { /* ignore */ }

    return json(200, { ok: true, refund_id: refund.id, amount_cents: refund.amount });
  } catch (err) {
    return json(500, { error: err.message || 'Refund failed' });
  }
}
