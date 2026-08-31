// netlify/functions/send-receipt.js
// Sends (or resends) a branded receipt for an order to the customer's email via
// Resend. Self-contained so it does not depend on notify-order internals. Pulls the
// order + items fresh, shows Mountain Time, honors a refunded state.
// Last updated 2026-06-27.
import { adminClient, json, requireStaff } from './_shared.js';

const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';

function mt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // STAFF ONLY, because `to` lets the caller choose the recipient. Open, this
  // was a way to send mail from orders@madebutter.com to any address on earth,
  // which is somebody else's spam problem right up until the domain's sending
  // reputation becomes yours.
  const gate = await requireStaff(event);
  if (gate.error) return gate.error;

  const db = adminClient();

  try {
    const { order_id, to } = JSON.parse(event.body || '{}');
    if (!order_id) return json(400, { error: 'order_id required' });
    if (!process.env.RESEND_API_KEY) return json(500, { error: 'Email is not configured.' });

    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return json(404, { error: 'Order not found' });

    const email = to || order.contact_email;
    if (!email) return json(400, { error: 'No email on file for this order.' });

    const { data: items } = await db.from('order_items').select('*').eq('order_id', order_id);

    const rows = (items || []).map((it) => `
      <tr>
        <td style="padding:6px 0;font-size:15px;color:#161412;">${it.qty} × ${it.item_name}</td>
        <td style="padding:6px 0;font-size:15px;color:#161412;text-align:right;">$${((it.line_total_cents || 0) / 100).toFixed(2)}</td>
      </tr>`).join('');

    const money = (c) => `$${((c || 0) / 100).toFixed(2)}`;
    const receipt = order.receipt_no || order.short_code;
    const refunded = order.status === 'refunded';

    const html = `
    <div style="margin:0;padding:0;background:#F5F2EB;">
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
        <div style="text-align:center;margin-bottom:24px;"><img src="${LOGO_URL}" alt="madebutter." width="150" style="height:auto;" /></div>
        <div style="background:#FFFFFF;border-radius:20px;padding:28px 24px;">
          <h1 style="font-size:20px;margin:0 0 4px;">Your receipt</h1>
          <p style="font-size:14px;color:#9b958c;margin:0 0 18px;">${receipt} &bull; ${mt(order.created_at)} MT</p>
          ${refunded ? `<div style="background:#F5F2EB;border-radius:12px;padding:12px;text-align:center;font-size:14px;font-weight:700;color:#B8503C;margin-bottom:16px;">Refunded ${money(order.refund_amount_cents)}</div>` : ''}
          <table style="width:100%;border-collapse:collapse;">${rows}</table>
          <div style="border-top:1px solid #eee;margin-top:14px;padding-top:14px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="font-size:14px;color:#3f3b36;">Subtotal</td><td style="font-size:14px;color:#3f3b36;text-align:right;">${money(order.subtotal_cents)}</td></tr>
              ${order.tax_cents ? `<tr><td style="font-size:14px;color:#3f3b36;">Tax</td><td style="font-size:14px;color:#3f3b36;text-align:right;">${money(order.tax_cents)}</td></tr>` : ''}
              <tr><td style="font-size:16px;font-weight:700;padding-top:6px;">Total</td><td style="font-size:16px;font-weight:700;text-align:right;padding-top:6px;">${money(order.total_cents)}</td></tr>
            </table>
          </div>
        </div>
        <p style="text-align:center;color:#9b958c;font-size:12px;margin-top:22px;">madebutter. &bull; Ridgway, Colorado</p>
      </div>
    </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>',
        to: email,
        subject: `Your madebutter receipt ${receipt}`,
        html,
      }),
    });
    if (!res.ok) {
      const out = await res.json().catch(() => ({}));
      return json(500, { error: out.message || 'Could not send receipt.' });
    }

    return json(200, { ok: true, sent_to: email });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
