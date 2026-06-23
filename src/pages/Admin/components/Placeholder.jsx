// src/pages/Admin/components/Placeholder.jsx
// Temporary section screen until the real one is built.
export default function Placeholder({ title }) {
  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>{title}</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--mb-text-muted)' }}>Coming in the next phase.</p>
    </div>
  );
}
