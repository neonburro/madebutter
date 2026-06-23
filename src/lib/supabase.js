// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon);

// Build a public URL for an image stored in the `menu` storage bucket.
// image_path is the bucket key, e.g. "donut-milk-ring-vanilla-milk.webp"
export function menuImageUrl(imagePath) {
  if (!imagePath) return null;
  return supabase.storage.from('menu').getPublicUrl(imagePath).data.publicUrl;
}
