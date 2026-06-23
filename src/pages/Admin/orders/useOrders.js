// src/pages/Admin/orders/useOrders.js
// Loads active orders with their items, subscribes to realtime so the board
// updates the moment a new order is paid or a status changes.
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

const ACTIVE = ['paid', 'preparing', 'ready'];

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const { data: rows } = await supabase
      .from('orders')
      .select('*')
      .in('status', ACTIVE)
      .order('created_at', { ascending: true });

    const ids = (rows || []).map((o) => o.id);
    let itemsByOrder = {};
    if (ids.length) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ids);
      for (const it of items || []) {
        (itemsByOrder[it.order_id] ||= []).push(it);
      }
    }
    const withItems = (rows || []).map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
    setOrders(withItems);
    if (!quiet) setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('orders-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        load(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const setStatus = useCallback(async (orderId, status) => {
    setOrders((prev) => {
      if (!ACTIVE.includes(status)) return prev.filter((o) => o.id !== orderId);
      return prev.map((o) => (o.id === orderId ? { ...o, status } : o));
    });
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) load(true);
  }, [load]);

  return { orders, loading, setStatus, reload: load };
}
