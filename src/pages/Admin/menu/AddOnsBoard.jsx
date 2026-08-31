// src/pages/Admin/menu/AddOnsBoard.jsx
//
// Managing the add on questions. Until this existed the only way to add a syrup
// was to write SQL, which means the shop could not change its own menu without
// a developer, which is the thing an admin exists to prevent.
//
// ── THE THREE SHAPES, NOT TWO NUMBER BOXES ──────────────────────────────────
//
// Underneath, a group's shape is min_select and max_select. Exposing those raw
// would mean a person setting min 2 max 1 and creating a question that can
// never be satisfied, and then a drink nobody can buy. So the editor offers the
// three shapes that are actually useful:
//
//   required, pick one      min 1  max 1     Milk
//   optional, pick one      min 0  max 1     Add a flavor
//   optional, pick several  min 0  max N     Extras
//
// Anything else is possible in the database and nothing here will produce it.
// If a fourth shape is ever genuinely needed, add it to SHAPES rather than
// exposing the numbers.
//
// ── DELETING ────────────────────────────────────────────────────────────────
//
// Deleting a group cascades to its options and to every item link, which is why
// it asks first and says how many items it is about to change. Orders are NOT
// affected, order_items carries a snapshot of what was chosen rather than a
// reference, so last week's receipt still reads correctly after the option is
// gone. That is the whole reason it is a snapshot.
//
// ── WRITES RELOAD RATHER THAN PATCH ─────────────────────────────────────────
//
// Every change writes and then asks the parent to refetch. This screen is used
// a few times a month by one person, so the round trip is free and it removes a
// whole class of bug where the tree in the browser and the rows in the database
// disagree. The Today board is the opposite and optimistic, because that one is
// used sixty times every morning.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/format';

const SHAPES = [
  { key: 'req-one', label: 'required, pick one', min: 1, max: 1 },
  { key: 'opt-one', label: 'optional, pick one', min: 0, max: 1 },
  { key: 'opt-many', label: 'optional, pick several', min: 0, max: 3 },
];

const shapeOf = (g) => {
  if ((g.min_select || 0) >= 1 && (g.max_select || 1) === 1) return 'req-one';
  if ((g.max_select || 1) > 1) return 'opt-many';
  return 'opt-one';
};

// "Oat milk" -> "oat-milk". Slugs are globally unique on both tables, so a
// short random tail keeps a second "Vanilla" from colliding with the first.
const slugify = (name, prefix) =>
  `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;

const priceToCents = (raw) => {
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export default function AddOnsBoard({ items = [] }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItemsFor, setOpenItemsFor] = useState(null);
  const [newOptionFor, setNewOptionFor] = useState(null);
  const [draft, setDraft] = useState({ name: '', price: '' });
  const [itemFilter, setItemFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [g, o, l] = await Promise.all([
      supabase.from('option_groups').select('*').order('sort_order'),
      supabase.from('options').select('*').order('sort_order'),
      supabase.from('item_option_groups').select('*'),
    ]);
    setGroups((g.data || []).map((grp) => ({
      ...grp,
      options: (o.data || []).filter((x) => x.option_group_id === grp.id),
      itemIds: (l.data || []).filter((x) => x.option_group_id === grp.id).map((x) => x.item_id),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const guard = async (fn) => {
    setError(null);
    const { error: e } = await fn();
    if (e) { setError(e.message); return false; }
    await load();
    return true;
  };

  const addGroup = () => guard(() => supabase.from('option_groups').insert({
    slug: slugify('question', 'grp'),
    name: 'New question',
    helper: 'pick one',
    min_select: 0,
    max_select: 1,
    sort_order: groups.length + 1,
  }));

  const renameGroup = (g, name) =>
    guard(() => supabase.from('option_groups').update({ name }).eq('id', g.id));

  const setShape = (g, key) => {
    const s = SHAPES.find((x) => x.key === key);
    return guard(() => supabase.from('option_groups')
      .update({ min_select: s.min, max_select: s.max }).eq('id', g.id));
  };

  const deleteGroup = (g) => {
    const n = g.itemIds.length;
    const ok = window.confirm(
      `Delete "${g.name}" and its ${g.options.length} answers?\n\n`
      + `It comes off ${n} item${n === 1 ? '' : 's'}. Past orders keep their record and are not affected.`,
    );
    if (!ok) return undefined;
    return guard(() => supabase.from('option_groups').delete().eq('id', g.id));
  };

  const addOption = async (g) => {
    if (!draft.name.trim()) return;
    const okay = await guard(() => supabase.from('options').insert({
      option_group_id: g.id,
      slug: slugify(draft.name, 'opt'),
      name: draft.name.trim(),
      price_delta: priceToCents(draft.price),
      sort_order: g.options.length + 1,
    }));
    if (okay) { setDraft({ name: '', price: '' }); setNewOptionFor(null); }
  };

  const deleteOption = (o) => guard(() => supabase.from('options').delete().eq('id', o.id));

  const toggleItem = (g, itemId) => {
    const on = g.itemIds.includes(itemId);
    return guard(() => (on
      ? supabase.from('item_option_groups').delete()
        .eq('option_group_id', g.id).eq('item_id', itemId)
      : supabase.from('item_option_groups').insert({
        option_group_id: g.id, item_id: itemId, sort_order: 0,
      })));
  };

  if (loading) {
    return <p className="py-8 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>loading add ons…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
          a question and its answers. attach a question to any items that should
          be asked it.
        </p>
        <button
          onClick={addGroup}
          className="flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold lowercase"
          style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)', boxShadow: 'var(--mb-shadow-card)' }}
        >
          <Plus size={18} /> new question
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(176,114,42,0.10)', color: 'var(--mb-accent-toast)' }}>
          {error}
        </p>
      )}

      {groups.length === 0 && (
        <p className="mt-10 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
          no questions yet. a milk choice on the nitro would be a good first one.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.id} className="rounded-2xl p-5" style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <input
                defaultValue={g.name}
                onBlur={(e) => e.target.value.trim() && e.target.value !== g.name && renameGroup(g, e.target.value.trim())}
                className="min-w-0 flex-1 rounded-xl px-3 py-2 text-lg font-bold outline-none"
                style={{ background: 'var(--mb-surface-sunk)' }}
                aria-label="Question name"
              />
              <select
                value={shapeOf(g)}
                onChange={(e) => setShape(g, e.target.value)}
                className="min-h-[44px] rounded-xl px-3 text-sm font-semibold outline-none"
                style={{ background: 'var(--mb-surface-sunk)' }}
                aria-label="How many can be chosen"
              >
                {SHAPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <button
                onClick={() => deleteGroup(g)}
                aria-label={`Delete ${g.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ color: 'var(--mb-accent-toast)' }}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {g.options.map((o) => (
                <span
                  key={o.id}
                  className="flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold"
                  style={{ background: 'var(--mb-surface-sunk)' }}
                >
                  {o.name}
                  {o.price_delta > 0 && (
                    <span className="mb-nums font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
                      +{formatPrice(o.price_delta)}
                    </span>
                  )}
                  <button onClick={() => deleteOption(o)} aria-label={`Remove ${o.name}`} style={{ color: 'var(--mb-text-muted)' }}>
                    <X size={15} />
                  </button>
                </span>
              ))}

              {newOptionFor === g.id ? (
                <span className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addOption(g)}
                    placeholder="answer"
                    className="min-h-[44px] w-36 rounded-full px-4 text-sm font-semibold outline-none"
                    style={{ background: 'var(--mb-surface-sunk)' }}
                  />
                  <input
                    value={draft.price}
                    onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addOption(g)}
                    placeholder="+0.00"
                    inputMode="decimal"
                    className="mb-nums min-h-[44px] w-24 rounded-full px-4 text-sm font-semibold outline-none"
                    style={{ background: 'var(--mb-surface-sunk)' }}
                  />
                  <button onClick={() => addOption(g)} className="min-h-[44px] rounded-full px-4 text-sm font-bold lowercase" style={{ background: 'var(--mb-accent-butter)' }}>
                    save
                  </button>
                  <button onClick={() => { setNewOptionFor(null); setDraft({ name: '', price: '' }); }} className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
                    cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => { setNewOptionFor(g.id); setDraft({ name: '', price: '' }); }}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-bold lowercase"
                  style={{ border: '2px dashed var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}
                >
                  <Plus size={16} /> answer
                </button>
              )}
            </div>

            <button
              onClick={() => setOpenItemsFor(openItemsFor === g.id ? null : g.id)}
              className="mt-4 flex min-h-[44px] items-center gap-2 text-sm font-bold lowercase"
              style={{ color: 'var(--mb-text-secondary)' }}
              aria-expanded={openItemsFor === g.id}
            >
              <ChevronDown
                size={16}
                style={{
                  transform: openItemsFor === g.id ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s var(--mb-ease)',
                }}
              />
              asked on <span className="mb-nums">{g.itemIds.length}</span> item{g.itemIds.length === 1 ? '' : 's'}
            </button>

            {openItemsFor === g.id && (
              <div className="mt-2">
                {/* THE FILTER IS NOT OPTIONAL AT THIS SIZE. There are seventy
                    odd items and an unfiltered wall of pills is unusable, which
                    would push somebody back to writing SQL, which is the exact
                    thing this screen exists to stop. Attached items always show
                    regardless of the filter, so you can always see and undo what
                    is already on. */}
                <input
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  placeholder="filter items"
                  className="mb-3 min-h-[44px] w-full max-w-xs rounded-full px-4 text-sm font-semibold outline-none"
                  style={{ background: 'var(--mb-surface-sunk)' }}
                />
                <div className="flex flex-wrap gap-2">
                {items.filter((it) => {
                  const q = itemFilter.trim().toLowerCase();
                  return !q || g.itemIds.includes(it.id) || it.name.toLowerCase().includes(q);
                }).map((it) => {
                  const on = g.itemIds.includes(it.id);
                  return (
                    <button
                      key={it.id}
                      onClick={() => toggleItem(g, it.id)}
                      aria-pressed={on}
                      className="min-h-[44px] rounded-full px-4 text-sm font-semibold"
                      style={{
                        background: on ? 'var(--mb-accent-butter)' : 'var(--mb-surface-sunk)',
                        color: 'var(--mb-text-primary)',
                      }}
                    >
                      {it.name}
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
