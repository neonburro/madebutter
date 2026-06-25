// netlify/functions/signup.js
// Email signup for the rewards list. Stores to email_signups, flags whether the
// email already has a customer account, and sends a clean branded welcome that
// nudges non-account-holders to create one. Raw fetch, no SDK.
import { adminClient, json } from './_shared.js';

const LOGO_URL = 'https://madebutter.netlify.app/madebutter-logo.png';
const SITE = 'https://madebutter.netlify.app';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { email, source } = JSON.parse(event.body || '{}');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return json(400, { error: 'Please enter a valid email.' });
    }
    const clean = email.trim().toLowerCase();

    const { data: existing } = await db.from('customers').select('id').ilike('email', clean).maybeSingle();
    const isCustomer = !!existing;

    await db.from('email_signups').upsert(
      { email: clean, source: source || 'footer', is_customer: isCustomer },
      { onConflict: 'email' }
    );

    if (process.env.RESEND_API_KEY) {
      const cta = isCustomer
        ? `<p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0;">You are on the list and you already have an account. Perfect. We will keep the good stuff coming.</p>`
        : `<p style="font-size:15px;line-height:1.6;color:#3f3b36;margin:0 0 18px;">You are on the list. Want the full treatment? Make an account and your rewards and orders all live in one place.</p>
           <a href="${SITE}/account/login/" style="display:inline-block;background:#161412;color:#F5D66B;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px;">Create my account</a>`;
      const html = `
      <div style="margin:0;padding:0;background:#F5F2EB;">
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#161412;">
          <div style="text-align:center;margin-bottom:24px;"><img src="${LOGO_URL}" alt="madebutter." width="160" /></div>
          <div style="background:#FFFFFF;border-radius:20px;padding:28px 24px;">
            <h1 style="font-size:20px;margin:0 0 10px;">Welcome to the good stuff.</h1>
            ${cta}
          </div>
          <p style="text-align:center;color:#9b958c;font-size:12px;margin-top:22px;">madebutter. &bull; Ridgway, Colorado</p>
        </div>
      </div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'madebutter. <orders@madebutter.com>',
          to: clean,
          subject: 'You are on the list',
          html,
        }),
      }).catch(() => {});
    }

    return json(200, { ok: true, isCustomer });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
