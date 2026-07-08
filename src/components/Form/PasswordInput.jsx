// src/components/Form/PasswordInput.jsx
// Reusable password field with a show/hide eye toggle. Matches the big-bold form
// vibe. Pass value, onChange, placeholder, and any extra props (autoComplete, etc).
// Optional borderColor overrides the default (for match-state hints).
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'password',
  autoComplete = 'current-password',
  borderColor,
  onKeyDown,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl px-4 py-4 pr-12 text-base font-medium outline-none"
        style={{ border: `1px solid ${borderColor || 'var(--mb-surface-line-strong)'}`, background: 'var(--mb-surface-base)' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
        style={{ color: 'var(--mb-text-muted)' }}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
