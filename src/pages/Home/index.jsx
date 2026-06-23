// src/pages/Home/index.jsx
// Fixed top nav, hero slideshow, sticky centered menu nav, menu bands, footer.
import { useState } from 'react';
import { useMenu } from '../../data/useMenu';
import TopNav from '../../components/Nav/TopNav';
import Footer from '../../components/Footer/Footer';
import Hero from './components/Hero';
import FamilyNav from './components/FamilyNav';
import MenuBand from './components/MenuBand';
import CartButton from '../../components/Cart/CartButton';
import CartSheet from '../../components/Cart/CartSheet';

export default function Home() {
  const { categories, loading, error } = useMenu();
  const [cartOpen, setCartOpen] = useState(false);

  const scrollToMenu = () => {
    const first = categories[0];
    if (first) document.getElementById(`cat-${first.slug}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  // TODO: point at the /suggest/ route once the suggestion form is built
  const goSuggest = () => scrollToMenu();

  return (
    <div className="w-full">
      <TopNav />
      <div className="h-[57px]" />

      <Hero onOrder={scrollToMenu} onSuggest={goSuggest} />
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
        <MenuBand key={cat.id} category={cat} />
      ))}

      <Footer />

      <CartButton onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
