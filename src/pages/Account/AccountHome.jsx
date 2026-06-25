// src/pages/Account/AccountHome.jsx
// Logged-in customer home. Greeting, their order history, promo opt-in toggle,
// sign out. RLS ensures they only ever see their own orders.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ButterMark from '../../components/Brand/ButterMark';

function money(c) { return `$${((c || 0) / 100).toFixed(2)}`; }
function when(iso) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AccountHome() {
  const { customer, firstName, signOut, updateProfile } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(item_name, qty, line_total_cents)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [customer]);

  if (!customer) return null;

  const togglePromos = () => updateProfile({ email_opt_in: !customer.email_opt_in });

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ButterMark size={32} />
          <h1 className="text-2xl font-semibold">Hi {firstName || 'there'}</h1>
        </div>
        <button onClick={signOut} className="text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>sign out</button>
      </div>

      <div className="mt-6 rounded-2xl p-4" style={{ border: '1px solid var(--mb-surface-line)' }}>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--mb-text-secondary)' }}>Send me rewards and promotions</span>
          <span onClick={togglePromos} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: customer.email_opt_in ? '#7AA85A' : 'var(--mb-surface-line-strong)' }}>
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: customer.email_opt_in ? 'translateX(22px)' : 'translateX(2px)' }} />
          </span>
        </label>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium uppercase" style={{ letterSpacing: '0.08em', color: 'var(--mb-text-muted)' }}>Your orders</h2>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--mb-surface-line-strong)' }}>
          <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>No orders yet. Time to fix that.</p>
          <Link to="/" className="mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>See the menu</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl p-4" style={{ border: '1px solid var(--mb-surface-line)' }}>
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-sm font-semibold">{o.receipt_no || o.short_code}</p>
                <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{when(o.created_at)}</span>
              </div>
              <div className="mt-2 space-y-1">
                {(o.order_items || []).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.item_name}</span>
                    <span style={{ color: 'var(--mb-text-muted)' }}>×{it.qty}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium" style={{ borderColor: 'var(--mb-surface-line)' }}>
                <span style={{ color: 'var(--mb-text-muted)', textTransform: 'capitalize' }}>{o.status}</span>
                <span>{money(o.total_cents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
