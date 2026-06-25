// src/pages/OrderConfirmation/index.jsx
// Order placed confirmation. Big bold readable vibe matching contact and suggestion.
// Logo links home. No em dashes, oxford commas or colons.
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ButterMark from '../../components/Brand/ButterMark';

export default function OrderConfirmation() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="mb-2"
      >
        <Link to="/" aria-label="madebutter. home"><ButterMark size={96} /></Link>
      </motion.div>

      <h1 className="mt-6 text-5xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Order placed</h1>
      <p className="mt-5 max-w-sm text-lg font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
        Thanks. Check your email for the details. We will let you know the moment your order is ready.
      </p>

      <Link to="/" className="mt-8 rounded-full px-7 py-3.5 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
        Back to the good stuff
      </Link>
    </main>
  );
}
