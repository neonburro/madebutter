// netlify/functions/suggestion.js
// Stores a timestamped suggestion (proof of who said it first) and emails the shop.
// Raw fetch, no SDK. Clean voice.
import { adminClient, json } from './_shared.js';

const TO_EMAIL = 'madebutter@neonburro.com';
const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { name, contact, idea } = JSON.parse(event.body || '{}');
    if (!idea || !idea.trim()) return json(400, { error: 'Tell us the idea first.' });

    const { data: row, error } = await db
      .from('suggestions')
      .insert({ name: name || null, contact: contact || null, idea: idea.trim() })
      .select('id, created_at')
      .single();
    if (error) throw error;

    if (process.env.RESEND_API_KEY) {
      const safe = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `
      <div style="margin:0;padding:0;background:#F5F2EB;">
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
          <div style="text-align:center;margin-bottom:22px;"><img src="${LOGO_URL}" alt="madebutter." width="150" /></div>
          <div style="background:#FFFFFF;border-radius:20px;padding:26px 22px;">
            <h1 style="font-size:18px;margin:0 0 12px;">New suggestion</h1>
            <div style="background:#F5F2EB;border-radius:14px;padding:16px;font-size:15px;line-height:1.6;white-space:pre-wrap;">${safe(idea)}</div>
            <p style="font-size:13px;color:#9b958c;margin-top:14px;">${safe(name) || 'anonymous'}${contact ? ' &bull; ' + safe(contact) : ''}<br/>logged ${new Date(row.created_at).toLocaleString('en-US', { timeZone: 'America/Denver' })} MT</p>
          </div>
        </div>
      </div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>', to: TO_EMAIL, subject: `New suggestion from ${safe(name) || 'someone'}`, html }),
      }).catch(() => {});
    }

    return json(200, { ok: true, id: row.id, created_at: row.created_at });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
