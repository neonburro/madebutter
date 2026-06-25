// netlify/functions/contact.js
// Receives a contact form submission and emails it to the shop via Resend.
// Same warm clean voice. No SDK, raw fetch. No em dashes, oxford commas, colons.
import { json } from './_shared.js';

const TO_EMAIL = 'madebutter@neonburro.com';
const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { name, contact, topic, message } = JSON.parse(event.body || '{}');
    if (!name || !contact || !message) {
      return json(400, { error: 'Please fill in your name, a way to reach you and a message.' });
    }
    if (!process.env.RESEND_API_KEY) {
      return json(500, { error: 'Email is not configured yet.' });
    }

    const safe = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const inner = `
      <h1 style="font-size:18px;margin:0 0 12px;">New message from the site</h1>
      <p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 6px;"><strong>${safe(name)}</strong></p>
      <p style="font-size:14px;color:#3f3b36;margin:0 0 2px;">Reach them at ${safe(contact)}</p>
      <p style="font-size:14px;color:#9b958c;margin:0 0 14px;">About ${safe(topic) || 'something'}</p>
      <div style="background:#F5F2EB;border-radius:14px;padding:16px;font-size:15px;line-height:1.6;color:#161412;white-space:pre-wrap;">${safe(message)}</div>`;

    const html = `
    <div style="margin:0;padding:0;background:#F5F2EB;">
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
        <div style="text-align:center;margin-bottom:24px;">
          <img src="${LOGO_URL}" alt="madebutter." width="150" style="display:inline-block;height:auto;" />
        </div>
        <div style="background:#FFFFFF;border-radius:20px;padding:28px 24px;">${inner}</div>
      </div>
    </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>',
        to: TO_EMAIL,
        reply_to: contact.includes('@') ? contact : undefined,
        subject: `New message: ${safe(name)} (${safe(topic) || 'general'})`,
        html,
      }),
    });
    if (!res.ok) {
      const out = await res.json().catch(() => ({}));
      return json(500, { error: out.message || 'Could not send your message.' });
    }

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
