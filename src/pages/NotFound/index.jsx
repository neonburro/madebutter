// src/pages/NotFound/index.jsx
// 404. Big bold readable vibe. Logo links home. No em dashes, oxford commas, colons.
import { Link } from 'react-router-dom';
import ButterMark from '../../components/Brand/ButterMark';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <Link to="/" aria-label="madebutter. home"><ButterMark size={88} /></Link>
      <h1 className="mt-6 text-5xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>404</h1>
      <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>That page took a day off.</p>
      <Link to="/" className="mt-8 rounded-full px-7 py-3.5 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
        Back to the good stuff
      </Link>
    </main>
  );
}
