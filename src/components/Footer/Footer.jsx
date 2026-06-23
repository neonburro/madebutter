// src/components/Footer/Footer.jsx
// Black footer, white "madebutter." text, subtle butter + matcha accents.
// Email/SMS toggle signup, placeholder links, Terms/Privacy, Powered by neonburro.
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [channel, setChannel] = useState('email');
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    setDone(true);
  };

  return (
    <footer style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
      <div className="mx-auto w-[98%] py-14">
        <div className="text-2xl font-semibold lowercase" style={{ letterSpacing: 'var(--tracking-logo)' }}>
          madebutter<span style={{ color: 'var(--mb-dark-accent)' }}>.</span>
        </div>
        <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--mb-dark-muted)' }}>
          Part bakery, part product lab. We make small-batch donuts, kolaches and stuffed rolls, test new ideas often, and let you order ahead and grab it on your way.
        </p>

        <div className="mt-8 max-w-sm">
          <p className="mb-3 text-xs font-medium uppercase" style={{ letterSpacing: '0.10em', color: 'var(--mb-dark-muted)' }}>
            Get the good stuff
          </p>

          {done ? (
            <p className="text-sm" style={{ color: '#A8B89A' }}>You're in. Talk soon.</p>
          ) : (
            <>
              <div className="mb-2 flex gap-2">
                {['email', 'sms'].map((c) => {
                  const active = channel === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChannel(c); setValue(''); }}
                      className="flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors"
                      style={{
                        border: `1px solid ${active ? 'var(--mb-dark-accent)' : 'var(--mb-dark-line)'}`,
                        background: active ? 'rgba(255,224,138,0.12)' : 'transparent',
                        color: active ? 'var(--mb-dark-accent)' : 'var(--mb-dark-muted)',
                      }}
                    >
                      {c === 'email' ? 'Email' : 'Text'}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={channel === 'email' ? 'you@email.com' : 'Phone number'}
                  inputMode={channel === 'email' ? 'email' : 'tel'}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--mb-dark-raised)', color: 'var(--mb-dark-text)', border: '1px solid var(--mb-dark-line)' }}
                />
                <button
                  onClick={submit}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold"
                  style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
                >
                  Join
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm" style={{ color: 'var(--mb-dark-muted)' }}>
          <Link to="/about/">About</Link>
          <Link to="/locations/">Locations</Link>
          <Link to="/contact/">Contact</Link>
          <Link to="/terms/">Terms</Link>
          <Link to="/privacy/">Privacy</Link>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--mb-dark-line)', color: 'var(--mb-dark-muted)' }}>
          <span>© {new Date().getFullYear()} madebutter.</span>
          <span>
            Powered by{' '}
            <a href="https://neonburro.com" target="_blank" rel="noopener noreferrer" style={{ color: '#A8B89A' }}>
              neonburro
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
