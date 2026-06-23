// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Payment Element theme — butter/ink with a matcha-whisper focus ring.
export const stripeAppearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#161412',
    colorBackground: '#FFFFFF',
    colorText: '#161412',
    colorTextSecondary: '#5E554C',
    colorDanger: '#B8792D',
    fontFamily: '"Inter Variable", -apple-system, BlinkMacSystemFont, sans-serif',
    borderRadius: '14px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid rgba(22,20,18,0.16)', boxShadow: 'none', padding: '12px' },
    '.Input:focus': { border: '1px solid #A8B89A', boxShadow: '0 0 0 3px rgba(168,184,154,0.25)' },
    '.Label': { color: '#5E554C', fontWeight: '500' },
  },
};
