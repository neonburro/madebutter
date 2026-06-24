// netlify/functions/notify-order.js
// Sends order notifications via SMS (Twilio) or email (Resend), per the customer's
// chosen channel. Two kinds: 'received' (right after payment) and 'ready' (locker
// assigned). Also sends an admin alert to ADMIN_EMAIL on 'received'.
// Voice: warm, quirky, positive, clean. No emoji, no em dashes, no oxford commas, no colons.
import { adminClient, json } from './_shared.js';

const ADMIN_EMAIL = 'madebutter@neonburro.com';
const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';
const SITE = 'https://madebutter.netlify.app';

async function sendSms(to, body) {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log('[notify-order] Twilio not configured, skipping SMS to', to);
    return { skipped: true, channel: 'sms' };
  }
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  const out = await res.json().catch(() => ({}));
  return { sent: res.ok, channel: 'sms', sid: out.sid, error: res.ok ? null : (out.message || 'send failed') };
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[notify-order] Resend not configured, skipping email to', to);
    return { skipped: true, channel: 'email' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>',
      to,
      subject,
      html,
    }),
  });
  const out = await res.json().catch(() => ({}));
  return { sent: res.ok, channel: 'email', id: out.id, error: res.ok ? null : (out.message || 'send failed') };
}

function money(cents) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

// Timestamp in Mountain Time (Denver), e.g. "Jun 24, 2026, 2:34 AM MST"
function mtTimestamp(iso) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleString('en-US', {
    timeZone: 'America/Denver',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
}

function emailShell(inner) {
  return `
  <div style="margin:0;padding:0;background:#F5F2EB;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
      <div style="text-align:center;margin-bottom:28px;">
        <img src="${LOGO_URL}" alt="madebutter." width="160" style="display:inline-block;height:auto;" />
      </div>
      <div style="background:#FFFFFF;border-radius:20px;padding:28px 24px;">
        ${inner}
      </div>
      <p style="text-align:center;color:#9b958c;font-size:12px;margin-top:24px;line-height:1.5;">
        madebutter. &bull; Ridgway, Colorado<br/>
        Small batch, made better
      </p>
    </div>
  </div>`;
}

function itemRows(items) {
  if (!items || !items.length) return '';
  const rows = items.map((it) =>
    `<tr>
      <td style="padding:6px 0;font-size:14px;color:#161412;">${it.qty} &times; ${it.item_name}</td>
      <td style="padding:6px 0;font-size:14px;color:#161412;text-align:right;">${money(it.line_total_cents)}</td>
    </tr>`
  ).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { order_id, kind } = JSON.parse(event.body || '{}');
    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return json(404, { error: 'Order not found' });

    const { data: items } = await db
      .from('order_items')
      .select('item_name, qty, line_total_cents')
      .eq('order_id', order_id);

    const ready = kind === 'ready';
    const locker = order.locker_number;
    const name = order.contact_name || 'there';
    const code = order.receipt_no || order.short_code;

    const smsBody = ready
      ? `madebutter. Hi ${name}, your order is ready and warm. Locker ${locker} is all yours. Come grab it.`
      : `madebutter. Thanks ${name}, we got your order and we're on it. We'll text your locker number the moment it's ready, or come on in.`;

    const itemList = (items || []).map((i) => `${i.qty} x ${i.item_name}`).join(', ');

    const customerSubject = ready
      ? `Your order is ready, ${name} (locker ${locker})`
      : `Order received, ${name}`;

    const customerInner = ready
      ? `<h1 style="font-size:20px;margin:0 0 8px;">Ready and warm.</h1>
         <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 16px;">
           Hi ${name}, your order is ready. <strong>Locker ${locker}</strong> is all yours. Come grab it, or step inside and say hi.
         </p>
         ${itemRows(items)}
         <p style="font-size:13px;color:#9b958c;margin-top:8px;">Order ${code}</p>`
      : `<h1 style="font-size:20px;margin:0 0 8px;">We're on it.</h1>
         <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 16px;">
           Thanks ${name}. Your order is in good hands and we are already making it. We will let you know the second it is ready. Come grab it or step inside and say hi.
         </p>
         ${itemRows(items)}
         <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;margin-top:8px;">
           <tr><td style="padding:10px 0 0;font-size:15px;font-weight:600;">Total</td>
           <td style="padding:10px 0 0;font-size:15px;font-weight:600;text-align:right;">${money(order.total_cents)}</td></tr>
         </table>
         <p style="font-size:13px;color:#9b958c;margin-top:14px;">Order ${code}<br/>${mtTimestamp(order.created_at)}</p>`;

    const customerHtml = emailShell(customerInner);

    let result;
    if (order.preferred_channel === 'sms' && order.contact_phone) {
      result = await sendSms(order.contact_phone, smsBody);
    } else if (order.contact_email) {
      result = await sendEmail(order.contact_email, customerSubject, customerHtml);
    } else if (order.contact_phone) {
      result = await sendSms(order.contact_phone, smsBody);
    } else {
      return json(400, { error: 'No contact channel on order' });
    }

    let adminResult = null;
    if (!ready) {
      const adminInner = `<h1 style="font-size:18px;margin:0 0 10px;">New order</h1>
        <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 6px;">
          <strong>${name}</strong> &bull; ${money(order.total_cents)} &bull; ${order.preferred_channel}
        </p>
        ${itemRows(items)}
        <p style="font-size:13px;color:#9b958c;margin-top:8px;">Order ${code}<br/>${mtTimestamp(order.created_at)}</p>
        <p style="margin-top:16px;"><a href="${SITE}/admin/orders/" style="color:#161412;font-weight:600;">Open the orders board &rarr;</a></p>`;
      adminResult = await sendEmail(ADMIN_EMAIL, `New order: ${name}, ${money(order.total_cents)} (${itemList})`, emailShell(adminInner));
    }

    const flag = ready ? { notified_ready: true } : { notified_received: true };
    await db.from('orders').update(flag).eq('id', order_id);

    return json(200, { ok: true, customer: result, admin: adminResult });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
