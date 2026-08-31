// src/pages/Home/index.jsx
// Transparent nav over hero, hero slideshow, About section, sticky menu nav, bands, footer.
import { useState } from 'react';
import { useMenu } from '../../data/useMenu';
import TopNav from '../../components/Nav/TopNav';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FamilyNav from './components/FamilyNav';
import MenuBand from './components/MenuBand';
import ItemDetailModal from './components/ItemDetailModal';
import CartButton from '../../components/Cart/CartButton';
import CartSheet from '../../components/Cart/CartSheet';
import Kolache from '../../components/Kolache/Kolache';
import { SAYS } from '../../data/kolache';

export default function Home() {
  const { categories, loading, error } = useMenu();
  const [cartOpen, setCartOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const scrollToMenu = () => {
    const first = categories[0];
    if (first) document.getElementById(`cat-${first.slug}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goSuggest = () => scrollToMenu();

  return (
    <div className="w-full">
      <TopNav />

      <Hero onOrder={scrollToMenu} onSuggest={goSuggest} />
      <AboutSection />
      <FamilyNav categories={categories} />

      {/* THE COUNTER ANSWERS, NOT THE MACHINE. These three used to read
          "Loading the menu…", "Menu is being prepped" and "Menu coming soon",
          which are three different voices and none of them is a person. A shop
          with somebody behind the counter does not display a status, it tells
          you what is going on. Same information, one voice, and the empty case
          stops sounding like an apology. */}
      {(loading || error || (!loading && !error && categories.length === 0)) && (
        <div className="mx-auto w-[92%] max-w-2xl py-20 sm:py-28">
          <Kolache
            size="lg"
            say={loading ? SAYS.fetching : SAYS.menuDown}
          />
        </div>
      )}

      {categories.map((cat) => (
        <MenuBand key={cat.id} category={cat} onOpen={setDetailItem} />
      ))}

      <CartButton onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}
