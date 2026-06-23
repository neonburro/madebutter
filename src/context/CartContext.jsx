// src/context/CartContext.jsx
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [bump, setBump] = useState(0);

  const add = useCallback((item) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id: item.id, slug: item.slug, name: item.name, price: item.price, image_path: item.image_path, qty: 1 }];
    });
    setBump((b) => b + 1);
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

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((n, l) => n + (l.price || 0) * l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, add, decrement, remove, clear, qtyOf, count, subtotal, bump }),
    [lines, add, decrement, remove, clear, qtyOf, count, subtotal, bump]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
