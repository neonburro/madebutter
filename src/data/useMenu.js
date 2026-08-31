// src/data/useMenu.js
//
// Fetches categories, groups and items from Supabase and nests them, then
// attaches each item's add on questions. Items come back with available today
// flavours first inside each group.
//
// WITH NO DATABASE CONFIGURED it serves the seed menu instead, so a fresh clone
// renders the whole site and anyone can work on the menu, the cards, the cart,
// the picker and the checkout without production credentials. See seedMenu.js.
//
// This CANNOT mask a real outage. It keys off whether the env exists, not off
// whether a request failed, so a configured client that cannot reach Supabase
// still takes the error path and the page says the menu is not up.
//
// ── THE OPTION JOIN IS THREE FLAT READS, NOT A NESTED SELECT ────────────────
// option_groups, options and item_option_groups come back whole and are
// stitched together here. Three small reads of tables with a dozen rows each
// beat a nested PostgREST select that has to be re-derived every time the
// shape changes, and it keeps the join in JavaScript where the next person can
// read it. If these tables ever grow past a few hundred rows, revisit.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { SEED_CATEGORIES } from './seedMenu';

export function useMenu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      if (!supabaseConfigured) {
        if (active) { setCategories(SEED_CATEGORIES); setLoading(false); }
        return;
      }

      try {
        const [cats, groups, items, optGroups, opts, links] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('groups').select('*').eq('is_active', true).order('sort_order'),
          supabase
            .from('items')
            .select('*')
            .eq('is_active', true)
            .order('is_available_today', { ascending: false })
            .order('sort_order'),
          supabase.from('option_groups').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('options').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('item_option_groups').select('*').order('sort_order'),
        ]);

        if (cats.error) throw cats.error;
        if (groups.error) throw groups.error;
        if (items.error) throw items.error;
        if (optGroups.error) throw optGroups.error;
        if (opts.error) throw opts.error;
        if (links.error) throw links.error;

        // question id -> the question with its answers already attached
        const groupById = new Map(
          (optGroups.data || []).map((g) => [
            g.id,
            { ...g, options: (opts.data || []).filter((o) => o.option_group_id === g.id) },
          ]),
        );

        // item id -> its questions, in the order the link rows ask for
        const questionsByItem = new Map();
        for (const link of links.data || []) {
          const g = groupById.get(link.option_group_id);
          if (!g) continue; // an inactive group, skip it rather than render an empty question
          if (!questionsByItem.has(link.item_id)) questionsByItem.set(link.item_id, []);
          questionsByItem.get(link.item_id).push(g);
        }

        const withOptions = (items.data || []).map((it) => ({
          ...it,
          option_groups: questionsByItem.get(it.id) || [],
        }));

        const nested = (cats.data || []).map((cat) => ({
          ...cat,
          groups: (groups.data || [])
            .filter((g) => g.category_id === cat.id)
            .map((g) => ({
              ...g,
              items: withOptions.filter((it) => it.group_id === g.id),
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
