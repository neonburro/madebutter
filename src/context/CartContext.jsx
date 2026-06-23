// src/context/CartContext.jsx
// Cart with inventory enforcement. add(item) respects item.stock_qty when the
// item tracks stock: it will not let the cart quantity exceed what's available.
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const CartContext = createContext(null);

function capFor(item) {
  if (item && item.track_stock && item.stock_qty != null) return item.stock_qty;
  return null;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [bump, setBump] = useState(0);

  const add = useCallback((item) => {
    const cap = capFor(item);
    let added = false;
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      const current = found ? found.qty : 0;
      if (cap != null && current >= cap) {
        return prev;
      }
      added = true;
      if (found) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, {
        id: item.id, slug: item.slug, name: item.name, price: item.price,
        image_path: item.image_path, qty: 1, cap,
      }];
    });
    if (added) setBump((b) => b + 1);
    return added;
  }, []);

  const decrement = useCallback((id) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    );
  }, []);

  const remove = useCallback((id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const qtyOf = useCallback((id) => {
    const found = lines.find((l) => l.id === id);
    return found ? found.qty : 0;
  }, [lines]);

  const atCap = useCallback((item) => {
    const cap = capFor(item);
    if (cap == null) return false;
    return qtyOf(item.id) >= cap;
  }, [qtyOf]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((n, l) => n + (l.price || 0) * l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, add, decrement, remove, clear, qtyOf, atCap, count, subtotal, bump }),
    [lines, add, decrement, remove, clear, qtyOf, atCap, count, subtotal, bump]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
