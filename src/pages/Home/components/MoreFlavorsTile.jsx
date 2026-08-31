// src/pages/Home/components/MoreFlavorsTile.jsx
//
// The last tile in a style grid, standing in for every flavor of that style
// which is not out today. Inside, up to nine of them fill a 3x3 grid edge to
// edge, desaturated, so it reads as a contact sheet of what else exists.
//
// ── IT HAS A CAPTION NOW ────────────────────────────────────────────────────
// It deliberately had none, which worked while it sat in a grid of cards that
// also had no captions. Every card in the grid now carries a name and a price
// underneath, so a silent tile broke the rhythm and read as a card that had
// failed to load rather than as a control. It gets a line in the same slot the
// cards use, and the count is the whole message.
//
// No em dashes, oxford commas or colons.

import { menuImageUrl } from '../../../lib/supabase';

export default function MoreFlavorsTile({ items, onOpen }) {
  const cells = items.slice(0, 9);

  return (
    <div className="group flex flex-col">
      <button
        onClick={onOpen}
        className="aspect-square w-full overflow-hidden text-left"
        style={{
          borderRadius: 'var(--mb-radius-plate)',
          background: 'var(--mb-surface-sunk)',
          boxShadow: 'var(--mb-shadow-card)',
        }}
        aria-label={`See ${items.length} more flavors of this style`}
      >
        <div className="grid h-full w-full grid-cols-3 grid-rows-3">
          {cells.map((item) => {
            const img = menuImageUrl(item.image_path);
            return (
              <div key={item.id} className="h-full w-full overflow-hidden" style={{ background: 'var(--mb-surface-sunk)' }}>
                {img && (
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    style={{ filter: 'grayscale(0.55)', opacity: 0.72 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </button>

      {/* same type sizes as ItemCard so the caption row does not step */}
      <div className="mt-2.5 px-1">
        <p className="mb-nums text-base font-bold leading-tight" style={{ letterSpacing: '-0.01em' }}>
          {items.length} more
        </p>
        <p className="mt-0.5 text-[15px] font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
          not out today
        </p>
      </div>
    </div>
  );
}
