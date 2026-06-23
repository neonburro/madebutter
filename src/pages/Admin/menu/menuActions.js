// src/pages/Admin/menu/menuActions.js
// Shared admin menu operations: image upload, slug helpers, sort persistence.
import { supabase } from '../../../lib/supabase';

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function uploadMenuImage(file, slug) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const key = `${slug || 'item-' + Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('menu')
    .upload(key, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return key;
}

export async function persistOrder(table, rows) {
  for (const r of rows) {
    const { error } = await supabase.from(table).update({ sort_order: r.sort_order }).eq('id', r.id);
    if (error) throw error;
  }
}
