// netlify/functions/pos-order.js
// Records an in-person POS sale. Computes subtotal/tax/total server-side from live
// item prices (never trusts client math on the money path). Writes the order as PAID
// with source 'pos' and status 'paid' so it joins the Orders board like an online
// order. Writes order_items (so it earns crumbs and shows in history). If a phone is
// captured, links or creates the customer for rewards. Payment is 'cash' or 'card'
// (card = tapped in the Stripe app, marked paid here). Returns receipt + change due.
// Last updated 2026-06-27.
import { adminClient, json, shortCode, requireStaff } from './_shared.js';
// The rate is shared with the storefront and online checkout rather than copied
// here by hand. See the note at the top of src/lib/tax.js.
import { computeTax } from '../../src/lib/tax.js';
// the same add on rule the online checkout uses. see _options.js.
import { priceLine } from './_options.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // STAFF ONLY. This writes an order with status PAID, so an open version of
  // it let anyone invent revenue and mint loyalty credit against it. The money
  // maths below was always correct and it was guarding the wrong thing: the
  // amounts could not be tampered with, but the sale itself could be fabricated.
  const gate = await requireStaff(event);
  if (gate.error) return gate.error;

  const db = adminClient();

  try {
    const body = JSON.parse(event.body || '{}');
    const { cart, payment_method, cash_tendered_cents, phone, first_name } = body;

    if (!Array.isArray(cart) || cart.length === 0) return json(400, { error: 'Cart is empty' });
    if (!['cash', 'card'].includes(payment_method)) return json(400, { error: 'Invalid payment method' });

    const ids = cart.map((c) => c.item_id);
    const { data: dbItems, error: itemsErr } = await db.from('items').select('*').in('id', ids);
    if (itemsErr) throw itemsErr;

    // ── THE REGISTER PRICES ADD ONS THE SAME WAY THE WEBSITE DOES ───────────
    // Same priceLine, same tables, same rules. Before this, a nitro rung up in
    // person was charged its BASE price no matter which milk was chosen, so the
    // upcharge was quietly given away at the counter and nothing recorded which
    // milk it was. Two rails pricing one menu by two rules is how a register
    // and a website drift apart.
    const [linkRes, optRes, groupRes] = await Promise.all([
      db.from('item_option_groups').select('item_id, option_group_id').in('item_id', ids),
      db.from('options').select('id, slug, name, price_delta, option_group_id, is_active'),
      db.from('option_groups').select('id, name, min_select, max_select, is_active'),
    ]);
    if (linkRes.error) throw linkRes.error;
    if (optRes.error) throw optRes.error;
    if (groupRes.error) throw groupRes.error;

    const lineItems = [];
    let subtotal = 0;
    for (const line of cart) {
      const dbItem = (dbItems || []).find((i) => i.id === line.item_id);
      if (!dbItem) return json(400, { error: 'An item is no longer available' });
      const qty = Math.max(1, parseInt(line.qty, 10) || 1);

      const priced = priceLine({
        item: dbItem,
        submittedOptionIds: line.options,
        links: linkRes.data || [],
        options: optRes.data || [],
        groups: groupRes.data || [],
      });
      if (!priced.ok) return json(400, { error: priced.error });

      const lineTotal = priced.unitPrice * qty;
      subtotal += lineTotal;
      lineItems.push({
        item_id: dbItem.id,
        item_slug: dbItem.slug || null,
        item_name: dbItem.name,
        unit_price_cents: priced.unitPrice,
        qty,
        line_total_cents: lineTotal,
        options: priced.chosen.length ? priced.chosen : null,
      });
    }

    const tax = computeTax(subtotal);
    const total = subtotal + tax;
    if (total <= 0) return json(400, { error: 'Order total must be greater than zero' });

    let changeCents = 0;
    if (payment_method === 'cash') {
      const tendered = parseInt(cash_tendered_cents, 10) || 0;
      if (tendered < total) return json(400, { error: 'Cash tendered is less than the total' });
      changeCents = tendered - total;
    }

    let customerId = null;
    if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9+]/g, '');
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
    }

    const { data: order, error: orderErr } = await db.from('orders').insert({
      short_code: shortCode(),
      customer_id: customerId,
      contact_name: first_name || null,
      contact_phone: phone ? String(phone).replace(/[^0-9+]/g, '') : null,
      preferred_channel: 'sms',
      status: 'paid',
      source: 'pos',
      subtotal_cents: subtotal,
      tax_cents: tax,
      total_cents: total,
      stripe_amount_cents: payment_method === 'card' ? total : null,
    }).select('id, short_code, receipt_no').single();
    if (orderErr) throw orderErr;

    const rows = lineItems.map((li) => ({ ...li, order_id: order.id }));
    const { error: liErr } = await db.from('order_items').insert(rows);
    if (liErr) throw liErr;

    for (const li of lineItems) {
      if (li.item_id) {
        try { await db.rpc('decrement_stock', { p_item_id: li.item_id, p_qty: li.qty }); } catch { /* ignore */ }
      }
    }

    return json(200, {
      ok: true,
      order_id: order.id,
      receipt: order.receipt_no || order.short_code,
      subtotal, tax, total,
      change_cents: changeCents,
    });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
