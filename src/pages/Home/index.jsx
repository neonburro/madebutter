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

      {loading && (
        <p className="py-16 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>Loading the menu…</p>
      )}
      {error && (
        <p className="py-16 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>Menu is being prepped. Check back in a moment.</p>
      )}
      {!loading && !error && categories.length === 0 && (
        <p className="py-16 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>Menu coming soon.</p>
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
