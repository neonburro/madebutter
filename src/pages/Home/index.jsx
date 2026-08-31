// src/pages/Home/index.jsx
//
// Nav over hero, hero, about, then the menu as one section per STYLE with a
// sticky style rail above it.
//
// The categories from Supabase are flattened into style sections here by
// src/data/menuShape.js. Read the note in that file before restoring anything
// category shaped, it explains why a nav made of categories was not really a
// nav on this particular menu.
//
// FamilyNav.jsx and MenuBand.jsx were the category versions of StyleNav and
// MenuSection and are deleted, not orphaned, so nobody wires them back by
// accident.
//
// No em dashes, oxford commas or colons.

import { useMemo, useState } from 'react';
import { useMenu } from '../../data/useMenu';
import { toSections, navSections } from '../../data/menuShape';
import TopNav from '../../components/Nav/TopNav';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import StyleNav from './components/StyleNav';
import MenuSection from './components/MenuSection';
import ItemDetailModal from './components/ItemDetailModal';
import CartButton from '../../components/Cart/CartButton';
import CartSheet from '../../components/Cart/CartSheet';
import Kolache from '../../components/Kolache/Kolache';
import { SAYS } from '../../data/kolache';

export default function Home() {
  const { categories, loading, error } = useMenu();
  const [cartOpen, setCartOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const sections = useMemo(() => toSections(categories), [categories]);
  const jumpable = useMemo(() => navSections(sections), [sections]);

  const scrollToMenu = () => {
    const first = jumpable[0] || sections[0];
    if (first) document.getElementById(`style-${first.slug}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const nothingToShow = !loading && !error && sections.length === 0;

  return (
    <div className="w-full">
      <TopNav />

      <Hero onOrder={scrollToMenu} onSuggest={scrollToMenu} />
      <AboutSection />

      {/* Where the food starts. TopNav.jsx watches this to decide when to stop
          being transparent, so the bar is glass over the hero and the about
          band and solid from here down. Moving it moves that moment. */}
      <div id="menu-start" aria-hidden="true" />

      {jumpable.length > 0 && <StyleNav sections={jumpable} />}

      {/* THE COUNTER ANSWERS, NOT THE MACHINE. These used to read "Loading the
          menu…", "Menu is being prepped" and "Menu coming soon", which are
          three voices and none of them is a person. */}
      {(loading || error || nothingToShow) && (
        <div className="mx-auto w-[92%] max-w-2xl py-20 sm:py-28">
          <Kolache size="lg" say={loading ? SAYS.fetching : SAYS.menuDown} />
        </div>
      )}

      {sections.map((section, i) => (
        <MenuSection
          key={section.id}
          section={section}
          // print the category once, above the first style that belongs to it
          showCategory={i === 0 || sections[i - 1].categorySlug !== section.categorySlug}
          onOpen={setDetailItem}
        />
      ))}

      <div className="h-16" />

      <CartButton onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}
