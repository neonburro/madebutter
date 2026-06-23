// src/lib/format.js
export const formatPrice = (cents) => {
  if (cents == null) return '';
  return `$${(cents / 100).toFixed(2)}`;
};
