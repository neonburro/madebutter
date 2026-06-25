// src/pages/Home/components/MoreFlavorsTile.jsx
// A single square tile standing in for a subgroup's not-today flavors. No label,
// no caption. Inside, the hidden flavors fill a 3x3 grid edge to edge (up to 9
// shown, touching). Tap anywhere to open the More Flavors popup.
import { menuImageUrl } from '../../../lib/supabase';

export default function MoreFlavorsTile({ items, onOpen }) {
  const cells = items.slice(0, 9);

  return (
    <button
      onClick={onOpen}
      className="aspect-square w-full overflow-hidden rounded-2xl"
      style={{ background: 'var(--mb-surface-paper)', border: '1px solid var(--mb-surface-line)' }}
      aria-label="See more of our flavors"
    >
      <div className="grid h-full w-full grid-cols-3 grid-rows-3">
        {cells.map((item) => {
          const img = menuImageUrl(item.image_path);
          return (
            <div key={item.id} className="h-full w-full overflow-hidden" style={{ background: 'var(--mb-surface-base)' }}>
              {img ? (
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: 'grayscale(0.45)', opacity: 0.85 }} />
              ) : (
                <div className="h-full w-full" style={{ background: 'var(--mb-surface-paper)' }} />
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}
