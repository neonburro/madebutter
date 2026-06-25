// src/pages/Home/components/MenuBand.jsx
// Full-width category band at the 98% layout standard (no max-width cap, bigger images).
// Grid: 2-up mobile, 5-up desktop. Live items show as cards; a subgroup's not-today
// flavors collapse into a single "more flavors" tile that opens a popup.
import { useState } from 'react';
import ItemCard from './ItemCard';
import MoreFlavorsTile from './MoreFlavorsTile';
import MoreFlavorsModal from './MoreFlavorsModal';

export default function MenuBand({ category, onOpen }) {
  const [moreFor, setMoreFor] = useState(null);

  return (
    <section id={`cat-${category.slug}`} className="w-full scroll-mt-28 py-12">
      <div className="mx-auto w-[98%]">
        <h2 className="px-1 text-3xl font-bold sm:text-4xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
          {category.name}
        </h2>

        {category.groups.map((group) => {
          const shown = group.items.filter((it) => it.is_available_today);
          const hidden = group.items.filter((it) => !it.is_available_today);
          return (
            <div key={group.id} className="mt-8">
              {category.groups.length > 1 && (
                <h3 className="mb-4 px-1 text-sm font-bold uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-text-muted)' }}>
                  {group.name}
                </h3>
              )}
              <div className="grid grid-cols-2 gap-x-1 gap-y-6 sm:gap-x-3 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-5">
                {shown.map((item) => (
                  <ItemCard key={item.id} item={item} onOpen={onOpen} />
                ))}
                {hidden.length > 0 && (
                  <MoreFlavorsTile items={hidden} onOpen={() => setMoreFor(group.id)} />
                )}
              </div>

              <MoreFlavorsModal
                open={moreFor === group.id}
                items={hidden}
                onClose={() => setMoreFor(null)}
                onPick={(item) => { setMoreFor(null); onOpen?.(item); }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
