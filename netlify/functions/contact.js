// netlify/functions/contact.js
// Receives a contact form submission, emails the shop an admin notification, and
// sends the person a warm branded confirmation. Raw fetch, no SDK. reply_to is set
// only to a clean single email so Resend never rejects it. Email and phone arrive as
// separate fields. No em dashes, oxford commas, colons.
// Last updated 2026-07-27.
import { json } from './_shared.js';

const TO_EMAIL = 'madebutter@neonburro.com';
const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';
const FROM = process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (s) => EMAIL_RE.test(String(s || '').trim());
const safe = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function shell(inner) {
  return `
  <div style="margin:0;padding:0;background:#F5F2EB;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="${LOGO_URL}" alt="madebutter." width="150" style="display:inline-block;height:auto;" />
      </div>
      <div style="background:#FFFFFF;border-radius:20px;padding:28px 24px;">${inner}</div>
      <p style="text-align:center;color:#9b958c;font-size:12px;margin-top:22px;">madebutter. &bull; Ridgway, Colorado</p>
    </div>
  </div>`;
}

async function sendEmail(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.message || 'Email send failed');
  }
  return res.json().catch(() => ({}));
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const topic = String(body.topic || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      return json(400, { error: 'Please add your name, your email and a message.' });
    }
    if (!isEmail(email)) {
      return json(400, { error: 'That email does not look right. Please check it.' });
    }
    if (!process.env.RESEND_API_KEY) {
      return json(500, { error: 'Email is not configured yet.' });
    }

    const reach = phone ? `${email} &bull; ${phone}` : email;

    const adminInner = `
      <h1 style="font-size:18px;margin:0 0 12px;">New message from the site</h1>
      <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 6px;"><strong>${safe(name)}</strong></p>
      <p style="font-size:14px;color:#3f3b36;margin:0 0 2px;">Reach them at ${safe(reach)}</p>
      <p style="font-size:14px;color:#9b958c;margin:0 0 14px;">About ${safe(topic) || 'something'}</p>
      <div style="background:#F5F2EB;border-radius:14px;padding:16px;font-size:15px;line-height:1.6;color:#161412;white-space:pre-wrap;">${safe(message)}</div>`;

    await sendEmail({
      from: FROM,
      to: TO_EMAIL,
      reply_to: email,
      subject: `New message: ${safe(name)} (${safe(topic) || 'general'})`,
      html: shell(adminInner),
    });

    const firstName = name.split(' ')[0];
    const custInner = `
      <h1 style="font-size:20px;margin:0 0 10px;">Got it, ${safe(firstName)}.</h1>
      <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 14px;">Thanks for reaching out. We read every message and will get back to you soon. If it is urgent, call or text us at (970) 696-7575.</p>
      <div style="background:#F5F2EB;border-radius:14px;padding:16px;font-size:14px;line-height:1.6;color:#161412;white-space:pre-wrap;">${safe(message)}</div>`;
    try {
      await sendEmail({
        from: FROM,
        to: email,
        subject: 'Thanks for reaching out to madebutter.',
        html: shell(custInner),
      });
    } catch { /* confirmation is best-effort */ }

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
