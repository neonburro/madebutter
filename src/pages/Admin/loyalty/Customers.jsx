// src/pages/Admin/loyalty/Customers.jsx
// Loyalty > Customers. Searchable list of everyone in the customers table with order
// count and total spent. Tap a customer for their detail: contact, list status, and
// full order history. Tap an order to refund (full) or send its receipt. Stripe is
// the source of truth for money; we mirror outcomes. Big bold admin vibe.
// Last updated 2026-06-27.
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Mail, MessageSquare, RotateCcw, Send, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { staffFetch } from '../../../lib/staffFetch';

const money = (c) => `$${((c || 0) / 100).toFixed(2)}`;
const mt = (iso) => iso ? new Date(iso).toLocaleString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

function useCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: customers } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    const { data: orders } = await supabase
      .from('orders')
      .select('id, customer_id, contact_email, contact_phone, total_cents, status, created_at')
      .in('status', ['paid', 'preparing', 'ready', 'picked_up', 'refunded']);

    const withStats = (customers || []).map((c) => {
      const theirs = (orders || []).filter((o) =>
        (o.customer_id && o.customer_id === c.id) ||
        (c.email && o.contact_email && o.contact_email.toLowerCase() === c.email.toLowerCase()) ||
        (c.phone && o.contact_phone && o.contact_phone === c.phone)
      );
      const spent = theirs.filter((o) => o.status !== 'refunded').reduce((n, o) => n + (o.total_cents || 0), 0);
      return { ...c, orderCount: theirs.length, spent };
    });
    setRows(withStats);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { rows, loading, reload: load };
}

function OrderDrawer({ order, onClose, onRefunded, onReceiptSent }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirmRefund, setConfirmRefund] = useState(false);

  useEffect(() => {
    if (!order) return;
    setItems([]); setMsg(null); setConfirmRefund(false);
    supabase.from('order_items').select('*').eq('order_id', order.id).then(({ data }) => setItems(data || []));
  }, [order]);

  if (!order) return null;
  const receipt = order.receipt_no || order.short_code;
  const refunded = order.status === 'refunded';

  const doRefund = async () => {
    setBusy('refund'); setMsg(null);
    try {
      const res = await staffFetch('/.netlify/functions/refund-order', { order_id: order.id });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ ok: true, text: `Refunded ${money(data.amount_cents)}.` });
      onRefunded && onRefunded(order.id);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally { setBusy(null); setConfirmRefund(false); }
  };

  const doReceipt = async () => {
    setBusy('receipt'); setMsg(null);
    try {
      const res = await staffFetch('/.netlify/functions/send-receipt', { order_id: order.id });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ ok: true, text: `Receipt sent to ${data.sent_to}.` });
      onReceiptSent && onReceiptSent();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally { setBusy(null); }
  };

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div className="fixed inset-0 z-[80]" style={{ background: 'rgba(15,14,13,0.4)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col overflow-y-auto p-6"
            style={{ background: 'var(--mb-surface-base)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold">{receipt}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{mt(order.created_at)} MT</p>
              </div>
              <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={24} /></button>
            </div>

            {refunded && (
              <div className="mt-4 rounded-xl px-4 py-2 text-center text-sm font-bold" style={{ background: 'rgba(184,80,60,0.1)', color: 'var(--mb-accent-toast)' }}>
                Refunded {money(order.refund_amount_cents)}
              </div>
            )}

            <div className="mt-6 space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-base font-semibold">
                  <span>{it.qty} × {it.item_name}</span>
                  <span style={{ color: 'var(--mb-text-muted)' }}>{money(it.line_total_cents)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
              <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                <span>Subtotal</span><span>{money(order.subtotal_cents)}</span>
              </div>
              {order.tax_cents ? (
                <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                  <span>Tax</span><span>{money(order.tax_cents)}</span>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between text-lg font-bold">
                <span>Total</span><span>{money(order.total_cents)}</span>
              </div>
              {order.stripe_amount_cents != null && (
                <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Stripe captured {money(order.stripe_amount_cents)}</p>
              )}
            </div>

            {msg && (
              <p className="mt-4 text-sm font-semibold" style={{ color: msg.ok ? '#5E7A45' : 'var(--mb-accent-toast)' }}>{msg.text}</p>
            )}

            <div className="mt-6 space-y-3">
              <button onClick={doReceipt} disabled={busy || !order.contact_email}
                className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold disabled:opacity-50"
                style={{ background: 'var(--mb-surface-paper)', color: 'var(--mb-text-primary)' }}>
                <Send size={18} /> {busy === 'receipt' ? 'Sending…' : 'Send receipt'}
              </button>

              {!refunded && (
                confirmRefund ? (
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(184,80,60,0.08)' }}>
                    <p className="text-sm font-bold" style={{ color: 'var(--mb-accent-toast)' }}>Refund {money(order.total_cents)} to this customer? This cannot be undone.</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setConfirmRefund(false)} className="flex-1 rounded-full py-3 text-sm font-bold" style={{ background: 'var(--mb-surface-base)', color: 'var(--mb-text-secondary)' }}>Cancel</button>
                      <button onClick={doRefund} disabled={busy} className="flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-50" style={{ background: 'var(--mb-accent-toast)', color: '#fff' }}>{busy === 'refund' ? 'Refunding…' : 'Yes, refund'}</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRefund(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
                    style={{ border: '1px solid var(--mb-accent-toast)', color: 'var(--mb-accent-toast)' }}>
                    <RotateCcw size={18} /> Refund order
                  </button>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CustomerDetail({ customer, onClose, onOrderChanged }) {
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!customer) return;
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const theirs = (data || []).filter((o) =>
      (o.customer_id && o.customer_id === customer.id) ||
      (customer.email && o.contact_email && o.contact_email.toLowerCase() === customer.email.toLowerCase()) ||
      (customer.phone && o.contact_phone && o.contact_phone === customer.phone)
    );
    setOrders(theirs);
  }, [customer]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (!customer) return null;

  return (
    <AnimatePresence>
      {customer && (
        <>
          <motion.div className="fixed inset-0 z-[75]" style={{ background: 'rgba(15,14,13,0.4)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-y-0 right-0 z-[75] flex w-full max-w-lg flex-col overflow-y-auto p-6"
            style={{ background: 'var(--mb-surface-paper)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{customer.name || 'No name'}</p>
                <p className="mt-1 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>{customer.email || 'no email'}</p>
                {customer.phone && <p className="text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>{customer.phone}</p>}
              </div>
              <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={26} /></button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: customer.email_opt_in ? 'rgba(122,168,90,0.15)' : 'var(--mb-surface-base)', color: customer.email_opt_in ? '#5E7A45' : 'var(--mb-text-muted)' }}>
                <Mail size={14} /> {customer.email_opt_in ? 'on email list' : 'not on email list'}
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: customer.sms_opt_in ? 'rgba(122,168,90,0.15)' : 'var(--mb-surface-base)', color: customer.sms_opt_in ? '#5E7A45' : 'var(--mb-text-muted)' }}>
                <MessageSquare size={14} /> {customer.sms_opt_in ? 'on sms list' : 'not on sms list'}
              </span>
            </div>

            <h3 className="mt-8 text-sm font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>Order history</h3>
            <div className="mt-3 space-y-2">
              {orders.length === 0 && <p className="text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>No orders yet.</p>}
              {orders.map((o) => (
                <button key={o.id} onClick={() => setOpenOrder(o)}
                  className="flex w-full items-center justify-between rounded-2xl p-4 text-left"
                  style={{ background: 'var(--mb-surface-base)' }}>
                  <div>
                    <p className="text-base font-bold">{o.receipt_no || o.short_code}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{mt(o.created_at)} · {o.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: o.status === 'refunded' ? 'var(--mb-accent-toast)' : 'var(--mb-text-primary)' }}>{money(o.total_cents)}</span>
                    <ChevronRight size={18} style={{ color: 'var(--mb-text-muted)' }} />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <OrderDrawer
            order={openOrder}
            onClose={() => setOpenOrder(null)}
            onRefunded={() => { loadOrders(); onOrderChanged && onOrderChanged(); }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

export default function Customers() {
  const { rows, loading, reload } = useCustomers();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  }, [rows, query]);

  return (
    <div className="px-4 py-8 sm:px-10">
      <h1 className="text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Customers</h1>
      <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{rows.length} total. Tap anyone to see their orders.</p>

      <div className="relative mt-6 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--mb-text-muted)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search name, email or phone"
          className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-base font-medium outline-none"
          style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }} />
      </div>

      {loading ? (
        <p className="mt-8 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--mb-surface-line)' }}>
          {filtered.map((c, i) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
              style={{ background: 'var(--mb-surface-base)', borderTop: i === 0 ? 'none' : '1px solid var(--mb-surface-line)' }}>
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{c.name || 'No name'}</p>
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{c.email || c.phone || 'no contact'}</p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-base font-bold">{money(c.spent)}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{c.orderCount} orders</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--mb-text-muted)' }} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-5 py-8 text-center text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>No customers match.</p>}
        </div>
      )}

      <CustomerDetail customer={selected} onClose={() => setSelected(null)} onOrderChanged={reload} />
    </div>
  );
}
