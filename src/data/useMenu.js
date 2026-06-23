// src/data/useMenu.js
// Fetches categories -> groups -> items from Supabase and nests them.
// Items are ordered so available-today flavors come first within each group.
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMenu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [cats, groups, items] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('groups').select('*').eq('is_active', true).order('sort_order'),
          supabase
            .from('items')
            .select('*')
            .eq('is_active', true)
            .order('is_available_today', { ascending: false })
            .order('sort_order'),
        ]);

        if (cats.error) throw cats.error;
        if (groups.error) throw groups.error;
        if (items.error) throw items.error;

        const nested = (cats.data || []).map((cat) => ({
          ...cat,
          groups: (groups.data || [])
            .filter((g) => g.category_id === cat.id)
            .map((g) => ({
              ...g,
              items: (items.data || []).filter((it) => it.group_id === g.id),
            })),
        }));

        if (active) setCategories(nested);
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return { categories, loading, error };
}
