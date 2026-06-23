// netlify/functions/resolve-staff-username.js
// Maps a staff username -> email so the client can sign in by username.
// Runs server-side (service role) so the username->email mapping is never exposed
// in the browser. Returns ONLY the email for a valid username, nothing else.
import { adminClient, json } from './_shared.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { username } = JSON.parse(event.body || '{}');
    if (!username || typeof username !== 'string') {
      return json(400, { error: 'Username required' });
    }

    const clean = username.trim().toLowerCase();

    const { data: staff, error } = await db
      .from('staff')
      .select('id')
      .ilike('username', clean)
      .single();

    if (error || !staff) {
      return json(404, { error: 'Invalid login' });
    }

    const { data: userResp, error: uErr } = await db.auth.admin.getUserById(staff.id);
    if (uErr || !userResp?.user?.email) {
      return json(404, { error: 'Invalid login' });
    }

    return json(200, { email: userResp.user.email });
  } catch (err) {
    return json(500, { error: 'Lookup failed' });
  }
}
