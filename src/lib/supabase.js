// src/lib/supabase.js
//
// ── A MISSING ENV MUST NOT TAKE THE WHOLE SITE DOWN ─────────────────────────
//
// createClient THROWS when the url is undefined, and it runs at module scope,
// so the throw happened during import and React never mounted. The result was
// a completely blank page: not a broken menu, the entire site, including the
// contact page, the legal pages and every word of marketing copy that needs no
// database at all.
//
// That is a single point of failure for a bakery's shopfront. A paused Supabase
// project, a Netlify deploy that lost a variable, or a fresh clone with no .env
// all produced the same white screen with one error in a console nobody has
// open.
//
// The client is now always constructed. When it is not configured it points at
// an unreachable host, so calls fail as ordinary network errors where the
// callers already catch them, and the site renders and tells you the menu is
// not up. See the loading and error states on the home page, which Kolache
// answers in person.
//
// `supabaseConfigured` is exported for anywhere that wants to say something
// more specific than "that failed".
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

if (!supabaseConfigured && import.meta.env.DEV) {
  // Loud in development, silent in production, where there is nothing a
  // visitor can do about it and the page already degrades on its own.
  console.warn(
    '[madebutter] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. ' +
    'The site will render but the menu, accounts and orders will not load.'
  );
}

export const supabase = createClient(
  url || 'https://unconfigured.invalid',
  anon || 'unconfigured',
);

// Build a public URL for an image stored in the `menu` storage bucket.
// image_path is the bucket key, e.g. "donut-milk-ring-vanilla-milk.webp"
export function menuImageUrl(imagePath) {
  if (!imagePath) return null;
  return supabase.storage.from('menu').getPublicUrl(imagePath).data.publicUrl;
}
