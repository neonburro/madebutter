// src/pages/Admin/loyalty/Rewards.jsx
// Loyalty > Rewards. The crumbs leaderboard. Crumbs are our loyalty points: 10 per
// dollar spent (a $10 order = 100 crumbs). Counts orders from a start date forward
// (fresh start), excludes refunded orders. Reads live from orders and ranks customers
// descending. Each rank shows a donut that fills relative to the leader. Built for
// recognition and email blasts. No stored balance yet; that comes with redemption.
// Last updated 2026-06-27.
import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Crumbs start counting from this date forward. Move earlier to include history.
const CRUMBS_START = '2026-06-27T00:00:00Z';
const CRUMBS_PER_DOLLAR = 10;
const EARNING_STATUSES = ['paid', 'preparing', 'ready', 'picked_up'];

const crumbsFor = (totalCents) => Math.round((totalCents || 0) / 100 * CRUMBS_PER_DOLLAR);

// A donut that fills proportionally (0..1). Not an emoji, a drawn SVG ring with a bite.
function DonutMeter({ fill = 0, size = 40 }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, fill));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mb-surface-line)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--mb-accent-butter)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - filled)}
      />
      <circle cx={size / 2} cy={size / 2} r={r / 2.6} fill="var(--mb-surface-base)" />
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
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Rewards</h1>
        {rows.length > 0 && (
          <span className="text-base font-bold" style={{ color: 'var(--mb-text-muted)' }}>{totalCrumbs.toLocaleString()} crumbs earned</span>
        )}
      </div>
      <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
        Crumbs are earned 10 per dollar. Most crumbs at the top.
      </p>

      {loading ? (
        <p className="mt-8 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>loading the board…</p>
      ) : rows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Trophy size={40} style={{ color: 'var(--mb-text-muted)' }} />
          <p className="mt-4 text-xl font-bold">No crumbs yet</p>
          <p className="mt-1 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>The board fills up as orders come in.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--mb-surface-line)' }}>
          {rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4"
              style={{ background: 'var(--mb-surface-base)', borderTop: i === 0 ? 'none' : '1px solid var(--mb-surface-line)' }}>
              <span className="w-8 flex-shrink-0 text-center text-lg font-bold" style={{ color: i < 3 ? RANK_COLOR[i] : 'var(--mb-text-muted)' }}>
                {i + 1}
              </span>
              <DonutMeter fill={r.crumbs / top} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold">{r.name || r.email || 'Guest'}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{r.orders} orders</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{r.crumbs.toLocaleString()}</p>
                <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>crumbs</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
