// src/lib/staffFetch.js
//
// POSTs to a staff-only Netlify function with the caller's Supabase access
// token attached. Use it for every endpoint guarded by requireStaff in
// netlify/functions/_shared.js, which today is refund-order, pos-order,
// pos-attach-rewards and send-receipt.
//
// ── WHY THIS EXISTS AS A HELPER ─────────────────────────────────────────────
// Because the alternative is remembering to add a header at four call sites
// and then at the fifth one somebody adds next month. The endpoint returns 401
// without the header, so a forgotten one fails loudly rather than silently,
// but a helper means it does not come up at all.
//
// ── ONE CLIENT, TWO KINDS OF USER ───────────────────────────────────────────
// Staff and customers both sign in through the same supabase client here, so
// getSession returns whichever is active. That is fine and it is deliberately
// not this file's problem: the server checks the token against the staff table
// and answers 403 to a customer. The browser never decides who is staff.
//
// No em dashes, oxford commas or colons.

import { supabase } from './supabase';

export async function staffFetch(path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  return fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
}

export default staffFetch;
