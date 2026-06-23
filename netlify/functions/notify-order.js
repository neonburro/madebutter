// netlify/functions/notify-order.js
// SHELL — inert until Twilio + Resend creds land. SMS if phone on file, else email.
import { adminClient, json } from './_shared.js';

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
  return { sent: res.ok, channel: 'sms' };
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
  return { sent: res.ok, channel: 'email' };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { order_id, kind } = JSON.parse(event.body || '{}');
    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return json(404, { error: 'Order not found' });

    const ready = kind === 'ready';
    const locker = order.locker_number;
    const name = order.contact_name || 'there';

    const smsBody = ready
      ? `madebutter. — Hi ${name}, your order ${order.short_code} is ready! Locker ${locker}. Come grab it.`
      : `madebutter. — Thanks ${name}! Order ${order.short_code} received. We'll text your locker number when it's ready.`;
    const emailSubject = ready
      ? `Your madebutter. order is ready — Locker ${locker}`
      : `madebutter. — order ${order.short_code} received`;
    const emailHtml = ready
      ? `<p>Hi ${name}, your order <strong>${order.short_code}</strong> is ready.</p><p>Locker <strong>${locker}</strong>. Come grab it, or step inside and we're happy to help.</p>`
      : `<p>Thanks ${name}! We got order <strong>${order.short_code}</strong>. We'll send your locker number when it's ready.</p>`;

    let result;
    if (order.preferred_channel === 'sms' && order.contact_phone) {
      result = await sendSms(order.contact_phone, smsBody);
    } else if (order.contact_email) {
      result = await sendEmail(order.contact_email, emailSubject, emailHtml);
    } else if (order.contact_phone) {
      result = await sendSms(order.contact_phone, smsBody);
    } else {
      return json(400, { error: 'No contact channel on order' });
    }

    const flag = ready ? { notified_ready: true } : { notified_received: true };
    await db.from('orders').update(flag).eq('id', order_id);

    return json(200, { ok: true, result });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
