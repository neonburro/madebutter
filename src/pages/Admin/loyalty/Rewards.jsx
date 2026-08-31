// src/pages/Admin/loyalty/Rewards.jsx
//
// The crumbs board. Who has collected what, ranked.
//
// ── EVERY NUMBER COMES FROM src/data/crumbs.js ──────────────────────────────
// The rate, the start date, the earning statuses and the ladder used to be
// declared privately at the top of this file. That was fine while this was the
// only screen that counted crumbs. It stopped being fine when the customer
// account grew a balance of its own, because two screens deriving a balance
// from two sets of constants eventually tell one person two different numbers.
//
// ── THE EARNED COLUMN IS THE POINT OF THIS SCREEN NOW ───────────────────────
// Redemption is not automated, there is no stored balance and nothing
// subtracts, so a free donut is handed over by a person at the counter. That
// person needs to know what the customer in front of them has actually earned,
// which is why the rung is on the row rather than only the raw number. Read the
// note in crumbs.js before building subtraction on top of this.
//
// No em dashes, oxford commas or colons.

import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  CRUMBS_START, CRUMBS_PER_DOLLAR, EARNING_STATUSES, crumbsFor, progress,
} from '../../../data/crumbs';

// A ring that fills 0..1. It is drawn as a donut because that is the shop's
// shape, NOT because the points are donuts. The points are crumbs.
function CrumbRing({ fill = 0, size = 40 }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, fill));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mb-surface-sunk)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--mb-accent-butter)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - filled)}
      />
      <circle cx={size / 2} cy={size / 2} r={r / 2.6} fill="var(--mb-surface-raised)" />
    </svg>
  );
}

function useLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: customers } = await supabase.from('customers').select('id, name, email, phone');
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_id, contact_email, contact_phone, contact_name, total_cents, status, created_at')
        .gte('created_at', CRUMBS_START)
        .in('status', EARNING_STATUSES);

      const board = (customers || []).map((c) => {
        const theirs = (orders || []).filter((o) =>
          (o.customer_id && o.customer_id === c.id) ||
          (c.email && o.contact_email && o.contact_email.toLowerCase() === c.email.toLowerCase()) ||
          (c.phone && o.contact_phone && o.contact_phone === c.phone)
        );
        const crumbs = theirs.reduce((n, o) => n + crumbsFor(o.total_cents), 0);
        return { id: c.id, name: c.name, email: c.email, crumbs, orders: theirs.length };
      })
      .filter((c) => c.crumbs > 0)
      .sort((a, b) => b.crumbs - a.crumbs);

      setRows(board);
      setLoading(false);
    })();
  }, []);

  return { rows, loading };
}

const RANK_COLOR = ['#D4A72C', '#A9A9A9', '#B5814A'];

export default function Rewards() {
  const { rows, loading } = useLeaderboard();
  const top = rows[0]?.crumbs || 1;
  const totalCrumbs = useMemo(() => rows.reduce((n, r) => n + r.crumbs, 0), [rows]);

  return (
    <div className="px-4 py-8 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl font-bold lowercase" style={{ letterSpacing: 'var(--tracking-heading)' }}>rewards</h1>
        {rows.length > 0 && (
          <span className="mb-nums text-base font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
            {totalCrumbs.toLocaleString()} crumbs earned
          </span>
        )}
      </div>
      <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
        {CRUMBS_PER_DOLLAR} crumbs per dollar. nothing subtracts yet, so hand the reward over at the counter.
      </p>

      {loading ? (
        <p className="mt-8 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>loading the board…</p>
      ) : rows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Trophy size={40} style={{ color: 'var(--mb-text-muted)' }} />
          <p className="mt-4 text-xl font-bold lowercase">no crumbs yet</p>
          <p className="mt-1 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>the board fills up as orders come in.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl" style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}>
          {rows.map((r, i) => {
            const { earned } = progress(r.crumbs);
            const rung = earned[earned.length - 1] || null;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--mb-surface-line)' }}>
                <span className="mb-nums w-8 flex-shrink-0 text-center text-lg font-bold" style={{ color: i < 3 ? RANK_COLOR[i] : 'var(--mb-text-muted)' }}>
                  {i + 1}
                </span>
                <CrumbRing fill={r.crumbs / top} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{r.name || r.email || 'Guest'}</p>
                  <p className="mb-nums text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                    {r.orders} orders
                    {/* what this person is owed, so staff can honour it */}
                    {rung && <span style={{ color: 'var(--mb-accent-toast)' }}> · earned {rung.reward}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mb-nums text-lg font-bold">{r.crumbs.toLocaleString()}</p>
                  <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>crumbs</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
