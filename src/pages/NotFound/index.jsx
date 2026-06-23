// src/pages/NotFound/index.jsx
import { Link } from 'react-router-dom';
import Wordmark from '../../components/Brand/Wordmark';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-3xl" />
      <p className="mt-6 text-sm" style={{ color: 'var(--mb-text-muted)' }}>That page took a day off.</p>
      <Link to="/" className="mt-6 text-sm font-medium" style={{ color: 'var(--mb-accent-toast)' }}>Back to menu →</Link>
    </main>
  );
}
