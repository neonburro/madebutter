// netlify/functions/pos-attach-rewards.js
// Attaches rewards to an already-paid POS order after the fact (the optional phone
// step shown post-payment). Finds or creates the customer by phone, links them to the
// order, and stamps the contact name. Best-effort: the sale is already recorded.
// Last updated 2026-06-27.
import { adminClient, json, requireStaff } from './_shared.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // STAFF ONLY. It attaches a customer to a paid order, which is how crumbs
  // get earned, so leaving it open was a way to mint rewards against somebody
  // else's purchases.
  const gate = await requireStaff(event);
  if (gate.error) return gate.error;

  const db = adminClient();

  try {
    const { order_id, phone, first_name } = JSON.parse(event.body || '{}');
    if (!order_id || !phone) return json(400, { error: 'order_id and phone required' });

    const cleanPhone = String(phone).replace(/[^0-9+]/g, '');

    let customerId = null;
    const { data: existing } = await db.from('customers').select('id').eq('phone', cleanPhone).maybeSingle();
    if (existing) {
      customerId = existing.id;
      if (first_name) await db.from('customers').update({ name: first_name }).eq('id', existing.id);
    } else {
      const { data: created } = await db.from('customers')
        .insert({ name: first_name || null, phone: cleanPhone, sms_opt_in: false, email_opt_in: false })
        .select('id').single();
      customerId = created?.id || null;
    }

    await db.from('orders').update({
      customer_id: customerId,
      contact_phone: cleanPhone,
      contact_name: first_name || null,
    }).eq('id', order_id);

    return json(200, { ok: true, customer_id: customerId });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
