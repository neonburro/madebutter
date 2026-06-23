// src/components/Brand/Wordmark.jsx
// The madebutter. wordmark. Lowercase, tight tracking, butter-yellow period.
export default function Wordmark({ dark = false, className = '' }) {
  return (
    <span
      className={`font-semibold lowercase ${className}`}
      style={{
        letterSpacing: 'var(--tracking-logo)',
        color: dark ? 'var(--mb-dark-text)' : 'var(--mb-text-primary)',
      }}
    >
      madebutter
      <span style={{ color: dark ? 'var(--mb-dark-accent)' : 'var(--mb-accent-butter)' }}>.</span>
    </span>
  );
}
