// netlify/functions/resolve-staff-username.js
// Maps a staff login identifier -> email so the client can sign in by username OR
// email. If the identifier looks like an email, we confirm it belongs to a staff
// member and return it. Otherwise we treat it as a username and resolve it. Runs
// server-side (service role) so the mapping is never exposed in the browser. Returns
// ONLY the email for a valid staff login, nothing else.
// Last updated 2026-06-27.
import { adminClient, json } from './_shared.js';

const looksLikeEmail = (s) => /\S+@\S+\.\S+/.test(s);

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const body = JSON.parse(event.body || '{}');
    const raw = body.identifier ?? body.username;
    if (!raw || typeof raw !== 'string') {
      return json(400, { error: 'Login required' });
    }
    const clean = raw.trim().toLowerCase();

    if (looksLikeEmail(clean)) {
      const { data: list } = await db.auth.admin.listUsers();
      const match = (list?.users || []).find((u) => (u.email || '').toLowerCase() === clean);
      if (!match) return json(404, { error: 'Invalid login' });
      const { data: staffRow } = await db.from('staff').select('id').eq('id', match.id).single();
      if (!staffRow) return json(404, { error: 'Invalid login' });
      return json(200, { email: match.email });
    }

    const { data: staff, error } = await db
      .from('staff')
      .select('id')
      .ilike('username', clean)
      .single();
    if (error || !staff) return json(404, { error: 'Invalid login' });

    const { data: userResp, error: uErr } = await db.auth.admin.getUserById(staff.id);
    if (uErr || !userResp?.user?.email) return json(404, { error: 'Invalid login' });

    return json(200, { email: userResp.user.email });
  } catch (err) {
    return json(500, { error: 'Lookup failed' });
  }
}
