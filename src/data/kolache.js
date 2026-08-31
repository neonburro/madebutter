// src/data/kolache.js
//
// ── KOLACHE RUNS THE COUNTER ────────────────────────────────────────────────
//
// He is canon. Kolache, The Counter, is a real burro from the neonburro roster
// (Voice crew, Restaurants lane) and his file there says everything that
// matters about how he behaves here:
//
//   says     "that is not on the menu."
//   thinks   knows the menu better than the new hire, including why item six
//            left it
//   reaches  the menu, the orders, the counter line
//   never    upsells what the kitchen regrets
//   voice    warm, quick, genuinely likes food. THE ONE AGENT ALLOWED TO BE
//            CHARMING.
//
// That last line is a licence and it is the reason he works on this site. Every
// other burro in the family is dry on purpose. He is the exception, and a
// bakery is exactly where the exception belongs.
//
// ── THE COINCIDENCE NOBODY PLANTED ──────────────────────────────────────────
//
// He was named Kolache long before this shop existed, and this shop sells
// kolaches. The category colour for kolaches here is #B8792D and his accent in
// the roster is #C8893B, which nobody coordinated either. Do not explain the
// pun anywhere on the site. It is better found than told.
//
// ── HE IS NOT A MASCOT ──────────────────────────────────────────────────────
//
// A mascot is a picture in a corner. Kolache is the person at the counter, so
// he only ever speaks where a counter person would actually say something: when
// a thing is sold out, when your box is empty, when an order lands. He does not
// greet, he does not narrate, and he never appears just to be seen.
//
// If you find yourself adding a line so he shows up on a page, do not. The
// restraint is what keeps him real rather than decorative.
//
// ── VOICE RULES ─────────────────────────────────────────────────────────────
// Lowercase, like the rest of the brand. Short. Never exclamation points, never
// upsells, never apologises twice. No oxford commas and no em dashes, which is
// house law across every property.

export const KOLACHE = {
  name: 'kolache',
  role: 'the counter',
  avatar: '/kolache/kolache-avatar.webp',
  portrait: '/kolache/kolache-portrait.webp',
  accent: '#C8893B',
};

// Keyed by the moment, not by the page. A line belongs to a situation somebody
// is actually in, which is why these read as answers rather than as captions.
export const SAYS = {
  // the footer. the only place he is present without being asked something.
  counter: 'i run the counter. i know what is in everything.',

  // the shop is not open yet and there is no address. this is the honest
  // version of that, in his voice, instead of the words coming soon.
  notOpenYet: 'no storefront yet. the kitchen is real and it is busy.',

  emptyCart: 'nothing in the box yet.',
  soldOut: 'that one is gone. it goes fast.',
  notOnMenu: 'that is not on the menu.',

  ordered: 'got it. we will let you know when it is warm.',
  refunded: 'that one is squared up. sorry about it.',

  suggest: 'tell me what you want. i will take it to the back.',
  listJoined: 'you are on the list. i will tell you when something new lands.',

  // shown while the menu is loading, because "loading..." is a machine talking
  // and there is a person at this counter
  fetching: 'checking what is out today.',
  menuDown: 'the menu is not up yet. give it a minute.',
};

export default KOLACHE;
