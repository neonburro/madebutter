// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Payment Element theme, ink and paper with a matcha whisper on focus.
//
// THESE HEXES ARE COPIES AND THEY HAVE TO BE. The Payment Element renders in a
// cross origin iframe, so it cannot see the site's CSS variables and every
// value has to be passed in literally. That makes this the one file that goes
// stale silently when the palette moves, because nothing here breaks, the
// checkout just quietly stops matching the shop.
//
// Each value below names the token in src/index.css it is a copy of. If you
// change a token there, change its twin here in the same commit.
export const stripeAppearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#33281C',        // --mb-text-primary
    colorBackground: '#FFFFFF',     // --mb-surface-raised
    colorText: '#33281C',           // --mb-text-primary
    colorTextSecondary: '#6E6152',  // --mb-text-secondary
    colorDanger: '#B0722A',         // --mb-accent-toast
    fontFamily: '"Inter Variable", -apple-system, BlinkMacSystemFont, sans-serif',
    borderRadius: '14px',
    spacingUnit: '4px',
  },
  rules: {
    // rgba(51,40,28,0.20) is --mb-surface-line-strong
    '.Input': { border: '1px solid rgba(51,40,28,0.20)', boxShadow: 'none', padding: '12px' },
    // was a sage #A8B89A, the last survivor of a palette that no longer exists.
    // toast is the theme's focus and warning tone, and it clears contrast on a
    // white field where butter would not.
    '.Input:focus': { border: '1px solid #B0722A', boxShadow: '0 0 0 3px rgba(176,114,42,0.22)' },
    '.Label': { color: '#6E6152', fontWeight: '500' },
  },
};
