// src/pages/OrderConfirmation/index.jsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Wordmark from '../../components/Brand/Wordmark';
import ButterMark from '../../components/Brand/ButterMark';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const channel = state?.channel; // 'sms' | 'email' | undefined
  const channelWord = channel === 'email' ? 'email' : channel === 'sms' ? 'text' : 'message';

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="mb-6"
      >
        <ButterMark size={72} />
      </motion.div>

      <Wordmark className="text-3xl" />
      <h1 className="mt-6 text-xl font-semibold">Order placed</h1>
      <p className="mt-3 max-w-xs text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
        Thanks! We're on it. We'll send your locker number by {channelWord} the moment it's ready — come grab it, or step inside for a few extra treats.
      </p>

      <Link to="/" className="mt-8 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
        Back to menu
      </Link>
    </main>
  );
}
