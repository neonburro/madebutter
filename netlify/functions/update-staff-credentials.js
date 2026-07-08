// netlify/functions/update-staff-credentials.js
// Lets a signed-in staffer change their username and/or password. Both require the
// current password (verified by a real sign-in attempt) before anything changes.
// Username updates the staff row; password updates the auth user. Service role.
import { createClient } from '@supabase/supabase-js';
import { adminClient, json } from './_shared.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const db = adminClient();

  try {
    const { user_id, current_password, new_username, new_password } = JSON.parse(event.body || '{}');
    if (!user_id || !current_password) {
      return json(400, { error: 'Missing required fields.' });
    }
    if (!new_username && !new_password) {
      return json(400, { error: 'Nothing to change.' });
    }

    const { data: userResp, error: uErr } = await db.auth.admin.getUserById(user_id);
    if (uErr || !userResp?.user?.email) {
      return json(404, { error: 'Account not found.' });
    }
    const email = userResp.user.email;

    const verifier = createClient(process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { error: signErr } = await verifier.auth.signInWithPassword({ email, password: current_password });
    if (signErr) {
      return json(401, { error: 'Current password is incorrect.' });
    }

    if (new_username) {
      const clean = new_username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
        return json(400, { error: 'Username must be 3 to 20 letters, numbers or underscores.' });
      }
      const { data: existing } = await db.from('staff').select('id').ilike('username', clean).maybeSingle();
      if (existing && existing.id !== user_id) {
        return json(409, { error: 'That username is taken.' });
      }
      const { error: nErr } = await db.from('staff').update({ username: clean }).eq('id', user_id);
      if (nErr) return json(500, { error: 'Could not update username.' });
    }

    if (new_password) {
      if (String(new_password).length < 8) {
        return json(400, { error: 'New password must be at least 8 characters.' });
      }
      const { error: pErr } = await db.auth.admin.updateUserById(user_id, { password: new_password });
      if (pErr) return json(500, { error: 'Could not update password.' });
    }

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
