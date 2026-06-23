// src/pages/Home/components/MenuBand.jsx
// Full-width category band at the 98% layout standard (no max-width cap, bigger images).
// Grid: 2-up mobile with near-touching gaps, 5-up desktop with large images.
import ItemCard from './ItemCard';

export default function MenuBand({ category }) {
  return (
    <section id={`cat-${category.slug}`} className="w-full scroll-mt-28 py-12">
      <div className="mx-auto w-[98%]">
        <h2 className="px-1 text-2xl font-semibold sm:text-3xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
          {category.name}
        </h2>

        {category.groups.map((group) => (
          <div key={group.id} className="mt-8">
            {category.groups.length > 1 && (
              <h3 className="mb-4 px-1 text-xs font-medium uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-text-muted)' }}>
                {group.name}
              </h3>
            )}
            <div className="grid grid-cols-2 gap-x-1 gap-y-6 sm:gap-x-3 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-5">
              {group.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
