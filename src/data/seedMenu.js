// src/data/seedMenu.js
//
// ── A MENU FOR WHEN THERE IS NO DATABASE ────────────────────────────────────
//
// Used ONLY when Supabase is not configured, which means a fresh clone with no
// .env or a local session where the project is paused. See useMenu.js for the
// switch and src/lib/supabase.js for what `supabaseConfigured` means.
//
// It CANNOT mask a real outage. It keys off whether the env exists, not off
// whether a request failed, so a configured client that cannot reach Supabase
// still takes the error path and Kolache says the menu is not up.
//
// ── IT MIRRORS THE REAL MENU'S SHAPE, NOT A TIDY DEMO ───────────────────────
//
// Production is sixty five items and its shape is the thing worth reproducing:
//
//   Donuts        6 styles of about 9 flavours each, roughly half on today
//   Kolaches      1 group, 3 items, all on
//   Stuffed Rolls Breakfast with 2 on, Lunch with 7 off AND PRICED AT ZERO
//   Drinks        3 groups, all of them empty
//
// Four of the six donut styles are here, which is enough to show the thing
// that actually makes this menu hard: THE SAME FLAVOUR NAME APPEARS IN SEVERAL
// STYLES. Vanilla Milk is a Milk Donut and a Cruller. Black Sesame Honey is in
// three. A design that reads well on a tidy demo menu falls apart on that, so
// the repetition is reproduced deliberately.
//
// Every awkward case in production is represented here on purpose:
//   • a name long enough to wrap a card
//   • no image_path anywhere, since a fresh clone has no storage bucket
//   • a sold out flavour and one with a single unit left
//   • a group with exactly one item
//   • the zero priced Lunch rolls, which exercise the guard in menuShape.js
//   • an empty category, which must not render at all
//
// If a layout survives this it will survive the real menu.
//
// Prices are in CENTS, matching the database.

const style = (id, name, slug, categoryId, sort, items) => ({
  id, name, slug, category_id: categoryId, sort_order: sort, is_active: true, items,
});

// flavour helper. `on` is is_available_today, `stock` null means untracked.
let seq = 0;
const flav = (groupId, name, price, on, stock = null) => {
  seq += 1;
  return {
    id: `i-${seq}`,
    group_id: groupId,
    slug: `${groupId}-${seq}`,
    name,
    description: null,
    price,
    is_active: true,
    is_available_today: on,
    track_stock: stock != null,
    stock_qty: stock,
    image_path: null,
    sort_order: seq,
  };
};

export const SEED_CATEGORIES = [
  {
    id: 'c-donuts', name: 'Donuts', slug: 'donuts', sort_order: 1, is_active: true,
    groups: [
      style('g-milk', 'Milk Donuts', 'milk-donuts', 'c-donuts', 1, [
        flav('g-milk', 'Vanilla Milk', 200, true),
        flav('g-milk', 'Chocolate Milk', 200, true, 50),
        flav('g-milk', 'Banana Creme', 250, true, 42),
        flav('g-milk', 'Matcha Milk', 225, true, 49),
        flav('g-milk', 'Coffee Milk', 225, true, 4),
        flav('g-milk', 'Black Sesame Honey', 225, false, 2),
        flav('g-milk', 'Strawberry Milk', 225, false, 0),
        flav('g-milk', 'Brown Butter Vanilla Salt', 225, false),
        flav('g-milk', 'Maple', 225, false, 50),
      ]),
      style('g-mochi', 'Mochi Rings', 'mochi-rings', 'c-donuts', 2, [
        flav('g-mochi', 'Vanilla Milk', 275, true),
        flav('g-mochi', 'Matcha Milk', 275, true),
        flav('g-mochi', 'Black Sesame Honey', 275, true),
        flav('g-mochi', 'Strawberry Milk', 275, true),
        flav('g-mochi', 'Chocolate Glaze', 275, false),
        flav('g-mochi', 'Maple', 275, false),
      ]),
      style('g-crullers', 'Crullers', 'crullers', 'c-donuts', 3, [
        flav('g-crullers', 'Chocolate Glaze', 275, true),
        flav('g-crullers', 'Orange Cream', 275, true),
        flav('g-crullers', 'Espresso Cream Splatter', 275, true),
        flav('g-crullers', 'Matcha Cream Splatter', 275, true),
        flav('g-crullers', 'Vanilla Milk', 275, false),
        // the long one. if a card cannot wrap this, the card is wrong.
        flav('g-crullers', 'Banana Cream Chocolate Splatter', 275, false),
        flav('g-crullers', 'Lemon Milk Splatter', 275, false),
        flav('g-crullers', 'Black Sesame Honey', 275, false),
        flav('g-crullers', 'White Mocha Mocha Splatter', 275, false),
      ]),
      // a whole style with nothing on today. the section must say so rather
      // than render an empty grid.
      style('g-fritters', 'Fritters', 'fritters', 'c-donuts', 4, [
        flav('g-fritters', 'Apple Cinnamon', 300, false),
        flav('g-fritters', 'Blueberry', 300, false),
        flav('g-fritters', 'Maple Bacon', 300, false),
      ]),
    ],
  },
  {
    id: 'c-kolaches', name: 'Kolaches', slug: 'kolaches', sort_order: 2, is_active: true,
    groups: [
      style('g-kolaches', 'Kolaches', 'kolaches', 'c-kolaches', 1, [
        flav('g-kolaches', 'All Beef Sausage', 500, true),
        flav('g-kolaches', 'All Beef Jalapeno Cheddar', 550, true),
        flav('g-kolaches', 'Vegan Maple Sausage Dairy Free Cheese', 550, true),
      ]),
    ],
  },
  {
    id: 'c-rolls', name: 'Stuffed Rolls', slug: 'stuffed-rolls', sort_order: 3, is_active: true,
    groups: [
      style('g-breakfast', 'Breakfast', 'breakfast', 'c-rolls', 1, [
        flav('g-breakfast', 'Sausage Gravy', 900, true),
        flav('g-breakfast', 'Bacon Egg Cheese', 850, true),
      ]),
      // PRICED AT ZERO, exactly as production has them. These must never be
      // orderable. menuShape.js is what stops it. Do not "fix" these to a real
      // price here, the point of them is to keep the guard exercised.
      style('g-lunch', 'Lunch', 'lunch', 'c-rolls', 2, [
        flav('g-lunch', 'Japanese Philly', 0, false),
        flav('g-lunch', 'Katsu Chicken', 0, false),
        flav('g-lunch', 'Brisket Cheddar Pepper', 0, false),
        flav('g-lunch', 'Green Chile Beef', 0, false),
      ]),
    ],
  },
  {
    id: 'c-drinks', name: 'Drinks', slug: 'drinks', sort_order: 4, is_active: true,
    groups: [
      style('g-coldbrew', 'Cold Brew', 'cold-brew', 'c-drinks', 1, [
        flav('g-coldbrew', 'Nitro Cold Brew', 500, true),
        flav('g-coldbrew', 'Nitro with Milk', 550, true),
        flav('g-coldbrew', 'Hot Nitro', 500, false),
      ]),
      style('g-milks', 'Milks', 'milks', 'c-drinks', 2, [
        flav('g-milks', 'Chocolate Milk', 375, true),
        flav('g-milks', 'Vanilla Milk', 375, true),
        flav('g-milks', 'Matcha Milk', 475, true),
        flav('g-milks', 'Coffee Milk', 425, true),
      ]),
      style('g-bottled', 'Bottled', 'bottled', 'c-drinks', 3, [
        flav('g-bottled', 'Banana Water', 425, true),
        flav('g-bottled', 'Chocolate Banana Water', 425, true),
      ]),
      // parked in production too, is_active false, nothing to put in it yet.
      // an EMPTY group must not render, which is the case this one covers.
      style('g-icy', 'Icy Machine', 'icy-machine', 'c-drinks', 4, []),
    ],
  },
];

// The about_section row, for the same reason the menu above exists. Without it
// the band under the hero rendered only its live board in dev and the copy half
// was invisible, so nobody could style the heading without production
// credentials. Production reads the real row and this is never used there.
export const SEED_ABOUT = {
  id: 1,
  heading: 'part bakery, part product lab.',
  body: 'we bake a short list every morning and change most of it by the next one. what is below is what is actually out today.',
};

export default SEED_CATEGORIES;
