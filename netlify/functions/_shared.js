// netlify/functions/_shared.js
import { createClient } from '@supabase/supabase-js';

export function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function shortCode() {
  const s = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return `MB-${s}`;
}

// ── WHO IS CALLING ──────────────────────────────────────────────────────────
//
// EVERY FUNCTION IN THIS FOLDER IS A PUBLIC URL. Nothing about living under
// /.netlify/functions/ makes an endpoint private, and being called only from
// the admin screen protects nothing: anyone can POST to it directly with curl.
//
// Before this existed, refund-order.js would issue a full Stripe refund to
// anyone who sent it an order id, and pos-order.js would write an order marked
// PAID to anyone who asked. The admin UI was the only thing standing in front
// of either, and a UI is not a permission.
//
// requireStaff verifies the caller's Supabase access token and then checks that
// the user is actually in the staff table. Both halves matter. A valid token
// only proves somebody signed in, and customers sign in here too, so without
// the staff lookup any customer account could refund any order.
//
// USAGE, at the very top of a protected handler:
//
//   const gate = await requireStaff(event);
//   if (gate.error) return gate.error;
//   // gate.user is the staff member
//
// Netlify lowercases incoming header names, but a direct invoke or a local dev
// proxy may not, so both spellings are read.
export async function requireStaff(event) {
  const raw =
    event.headers?.authorization ||
    event.headers?.Authorization ||
    '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) return { error: json(401, { error: 'Not authorised.' }) };

  const db = adminClient();

  const { data: userData, error: uErr } = await db.auth.getUser(token);
  if (uErr || !userData?.user) return { error: json(401, { error: 'Not authorised.' }) };

  const { data: staff, error: sErr } = await db
    .from('staff')
    .select('id')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (sErr || !staff) return { error: json(403, { error: 'Staff only.' }) };

  return { user: userData.user };
}
