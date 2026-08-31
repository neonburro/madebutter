// netlify/functions/create-payment-intent.js
// Recomputes totals from the DB (never trusts the client), enforces stock,
// writes a PENDING order + items to our database, then creates a Stripe
// PaymentIntent carrying only the order id in metadata (no size limit).
import Stripe from 'stripe';
import { adminClient, json, shortCode } from './_shared.js';
// The rate is shared with the storefront and the register rather than copied
// here by hand. See the note at the top of src/lib/tax.js.
import { computeTax } from '../../src/lib/tax.js';
// the add on rule, extracted so it can be run against the attack cases. see
// the note at the top of _options.js.
import { priceLine } from './_options.js';

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
      .select('id, slug, name, price, is_active, is_available_today, track_stock, stock_qty')
      .in('slug', slugs);

    if (error) throw error;

    // ── ADD ONS ARE RE-DERIVED HERE, NEVER ACCEPTED ─────────────────────────
    //
    // The browser sends option IDS ONLY. Every name and every price below comes
    // back out of the database, because an option id is just a uuid in a request
    // body and the two things a caller could otherwise do are obvious:
    //
    //   send an option belonging to a different item, which is why every
    //   submitted option is checked against the groups the item actually offers
    //
    //   skip a required group or send twenty of a capped one, which is why
    //   min_select and max_select are re-checked here rather than trusted from
    //   the picker that already checked them
    //
    // Ids are deduped first. Sending the same option twice would otherwise
    // count twice against a group's maximum and, the day an option carries a
    // negative delta, would subtract twice.
    //
    // All options and groups are fetched whole rather than filtered. They are a
    // dozen rows each. If that stops being true, filter by the offered group ids.
    const itemIds = (items || []).map((i) => i.id);
    const [linkRes, optRes, groupRes] = await Promise.all([
      db.from('item_option_groups').select('item_id, option_group_id').in('item_id', itemIds),
      db.from('options').select('id, slug, name, price_delta, option_group_id, is_active'),
      db.from('option_groups').select('id, name, min_select, max_select, is_active'),
    ]);
    if (linkRes.error) throw linkRes.error;
    if (optRes.error) throw optRes.error;
    if (groupRes.error) throw groupRes.error;

    const allLinks = linkRes.data || [];
    const allOptions = optRes.data || [];
    const allGroups = groupRes.data || [];

    let subtotal = 0;
    const lineItems = [];
    const shortfalls = [];

    for (const c of cart) {
      const dbItem = items.find((i) => i.slug === c.slug);
      if (!dbItem || !dbItem.is_active || !dbItem.is_available_today) {
        return json(400, { error: `Item unavailable: ${c.slug}` });
      }
      const qty = Math.max(1, parseInt(c.qty, 10) || 1);

      if (dbItem.track_stock) {
        const available = dbItem.stock_qty == null ? 0 : dbItem.stock_qty;
        if (qty > available) {
          shortfalls.push({ slug: dbItem.slug, name: dbItem.name, requested: qty, available });
          continue;
        }
      }

      const priced = priceLine({
        item: dbItem,
        submittedOptionIds: c.options,
        links: allLinks,
        options: allOptions,
        groups: allGroups,
      });
      if (!priced.ok) return json(400, { error: priced.error });

      const { unitPrice, chosen } = priced;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      lineItems.push({
        item_id: dbItem.id,
        item_slug: dbItem.slug,
        item_name: dbItem.name,
        unit_price_cents: unitPrice,
        qty,
        line_total_cents: lineTotal,
        options: chosen.length ? chosen : null,
      });
    }

    if (shortfalls.length) {
      return json(409, { error: 'stock_changed', shortfalls });
    }

    const tax = computeTax(subtotal);
    const total = subtotal + tax;
    if (total <= 0) return json(400, { error: 'Order total must be greater than zero' });

    // Write a PENDING order now. The cart lives in our DB, not Stripe metadata.
    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        short_code: shortCode(),
        contact_name: contact?.name || null,
        contact_phone: contact?.channel === 'sms' ? (contact?.phone || null) : null,
        contact_email: contact?.channel === 'email' ? (contact?.email || null) : null,
        preferred_channel: contact?.channel || 'sms',
        status: 'pending',
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: total,
      })
      .select('id')
      .single();
    if (orderErr) throw orderErr;

    const rows = lineItems.map((li) => ({ ...li, order_id: order.id }));
    const { error: itemsErr } = await db.from('order_items').insert(rows);
    if (itemsErr) throw itemsErr;

    const saveInfo = contact?.saveInfo ? 'true' : 'false';

    const intent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: order.id,
        save_info: saveInfo,
      },
    });

    await db.from('orders').update({ stripe_payment_intent_id: intent.id }).eq('id', order.id);

    return json(200, { clientSecret: intent.client_secret, order_id: order.id, subtotal, tax, total });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
