// src/components/Footer/Footer.jsx
// Mixed-direction footer: warm butter-black base, a mint + butter accent strip so
// it pops, and a small lab-stamp line crediting Burroship as the operating parent
// (kitchen, rewards, payments). Newsletter signup, link columns, bottom bar.
import { useState } from 'react';
import { Link } from 'react-router-dom';

const MINT = '#A8B89A';

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
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${MINT} 0%, var(--mb-accent-butter) 100%)` }} />

      <div className="mx-auto w-[98%] py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <div className="text-3xl font-semibold lowercase" style={{ letterSpacing: 'var(--tracking-logo)' }}>
              madebutter<span style={{ color: 'var(--mb-dark-accent)' }}>.</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>
              part bakery, part product lab. small batch donuts, kolaches, stuffed rolls and coffee. made fresh, packed clean, travel ready. order ahead or come on in.
            </p>
            <p className="mt-4 text-sm" style={{ color: 'var(--mb-dark-muted)' }}>100 campbell lane, ridgway, colorado</p>
            <a href="tel:+19706967575" className="mt-1 block text-sm" style={{ color: MINT }}>(970) 696-7575</a>
          </div>

          <div className="sm:max-w-sm sm:justify-self-end sm:w-full">
            <p className="mb-3 text-xs font-medium lowercase" style={{ letterSpacing: '0.10em', color: MINT }}>
              get the good stuff
            </p>

            {done ? (
              <p className="text-sm" style={{ color: MINT }}>you're in. talk soon.</p>
            ) : (
              <>
                <div className="mb-2 flex gap-2">
                  {['email', 'sms'].map((c) => {
                    const active = channel === c;
                    return (
                      <button
                        key={c}
                        onClick={() => { setChannel(c); setValue(''); }}
                        className="flex-1 rounded-lg py-2 text-xs font-medium lowercase transition-colors"
                        style={{
                          border: `1px solid ${active ? 'var(--mb-dark-accent)' : 'var(--mb-dark-line)'}`,
                          background: active ? 'rgba(255,224,138,0.12)' : 'transparent',
                          color: active ? 'var(--mb-dark-accent)' : 'var(--mb-dark-muted)',
                        }}
                      >
                        {c === 'email' ? 'email' : 'text'}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={channel === 'email' ? 'you@email.com' : 'phone number'}
                    inputMode={channel === 'email' ? 'email' : 'tel'}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--mb-dark-raised)', color: 'var(--mb-dark-text)', border: '1px solid var(--mb-dark-line)' }}
                  />
                  <button
                    onClick={submit}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold lowercase"
                    style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
                  >
                    join
                  </button>
                </div>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--mb-dark-muted)' }}>
                  rewards are coming through burroship.{' '}
                  <a href="https://burroship.com/rewards" target="_blank" rel="noopener noreferrer" style={{ color: MINT }}>
                    peek at the program
                  </a>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm lowercase" style={{ color: 'var(--mb-dark-muted)' }}>
          <Link to="/contact/">contact</Link>
          <Link to="/terms/">terms</Link>
          <Link to="/privacy/">privacy</Link>
          <a href="https://burroship.com/rewards" target="_blank" rel="noopener noreferrer">rewards</a>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs lowercase sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--mb-dark-line)', color: 'var(--mb-dark-muted)' }}>
          <span>© {new Date().getFullYear()} madebutter.</span>
          <div className="flex items-center gap-5">
            <Link to="/admin/" style={{ color: 'var(--mb-dark-muted)' }}>back of house</Link>
            <span>
              powered by{' '}
              <a href="https://neonburro.com" target="_blank" rel="noopener noreferrer" style={{ color: MINT }}>
                neonburro
              </a>
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-xl px-4 py-3 text-center text-[11px] uppercase" style={{ background: 'var(--mb-dark-raised)', color: 'var(--mb-dark-muted)', letterSpacing: '0.12em' }}>
          kitchen, rewards and payments operated by{' '}
          <a href="https://burroship.com" target="_blank" rel="noopener noreferrer" style={{ color: MINT }}>burroship</a>
        </div>
      </div>
    </footer>
  );
}
