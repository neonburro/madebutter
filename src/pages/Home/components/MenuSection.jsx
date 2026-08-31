// src/pages/Home/components/MenuSection.jsx
//
// One STYLE of donut, or one small group like Kolaches. Replaces MenuBand,
// which rendered a whole category with the styles as small subheadings inside
// it. That put the six things a person is choosing between two levels deep
// under a word, Donuts, that describes almost the entire menu. Here the style
// is the heading and the category is a kicker above it, and the kicker only
// prints when the category CHANGES, so you see Donuts once rather than six
// times. See src/data/menuShape.js for why the group is the real unit.
//
// ── TODAY IS THE GRID, THE REST IS ONE TILE ─────────────────────────────────
// Everything not on today collapses into a single more flavors tile that opens
// a popup. That was already the shape here and it was the right call, it just
// could not do its job while the grid it sat in was also full of greyed out
// cards. Now the grid is only things you can buy.
//
// The anchor id is style-{slug} and StyleNav.jsx builds the same string. If one
// side changes the nav silently scrolls nowhere, so change both.
//
// No em dashes, oxford commas or colons.

import { useState } from 'react';
import ItemCard from './ItemCard';
import MoreFlavorsTile from './MoreFlavorsTile';
import MoreFlavorsModal from './MoreFlavorsModal';

export default function MenuSection({ section, showCategory, onOpen }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { today, rest } = section;

  return (
    <section id={`style-${section.slug}`} className="mb-anchor w-full pb-4 pt-10">
      <div className="mx-auto w-[98%]">
        {showCategory && (
          <p
            className="px-1 pb-1 text-xs font-bold uppercase"
            style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}
          >
            {section.categoryName}
          </p>
        )}

        <div className="flex items-baseline gap-3 px-1">
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
            {section.name}
          </h2>
          {today.length > 0 && (
            <span className="mb-nums text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
              {today.length} today
            </span>
          )}
        </div>

        {today.length === 0 ? (
          // a style with nothing on. it still gets a section so the flavours
          // stay findable, but it says so plainly instead of showing a wall of
          // greyed cards.
          <div className="mt-5 flex flex-wrap items-center gap-3 px-1">
            <p className="text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
              none of these are out today.
            </p>
            {rest.length > 0 && (
              <button
                onClick={() => setMoreOpen(true)}
                className="rounded-full px-4 py-2 text-sm font-bold lowercase"
                style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
              >
                see the {rest.length} flavors
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-5">
            {today.map((item) => (
              <ItemCard key={item.id} item={item} onOpen={onOpen} />
            ))}
            {rest.length > 0 && (
              <MoreFlavorsTile items={rest} onOpen={() => setMoreOpen(true)} />
            )}
          </div>
        )}

        <MoreFlavorsModal
          open={moreOpen}
          items={rest}
          onClose={() => setMoreOpen(false)}
          onPick={(item) => { setMoreOpen(false); onOpen?.(item); }}
        />
      </div>
    </section>
  );
}
