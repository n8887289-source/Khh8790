import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogOut, Package, X } from 'lucide-react';
import { useBodyLock, useEscapeKey } from '../lib/hooks';
import { useStore } from '../store/StoreContext';

type Mode = 'signin' | 'register';

export function AccountModal() {
  const { accountOpen, setAccountOpen, customer, signIn, registerAccount, signOut, favorites } =
    useStore();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useBodyLock(accountOpen);
  useEscapeKey(accountOpen, () => setAccountOpen(false));

  useEffect(() => {
    if (!accountOpen) return;
    setError(null);
    setPassword('');
  }, [accountOpen, mode]);

  if (!accountOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await registerAccount({ email, name, password });
      }
      setAccountOpen(false);
      setEmail('');
      setName('');
      setPassword('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 py-16" role="dialog" aria-modal="true" aria-label="Account">
      <div
        className="fixed inset-0 bg-void/85 backdrop-blur-sm"
        onClick={() => setAccountOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl border border-graphite bg-midnight p-6">
        <button
          type="button"
          className="icon-btn absolute right-3 top-3"
          aria-label="Close account panel"
          onClick={() => setAccountOpen(false)}
        >
          <X size={18} />
        </button>

        {customer ? (
          <div>
            <p className="label-xs">Signed in</p>
            <h2 className="mt-2 text-2xl font-semibold">{customer.name || 'SONIQUE listener'}</h2>
            <p className="mt-1 text-sm text-mist">{customer.email}</p>

            <div className="mt-6 space-y-2">
              <Link
                to="/favorites"
                onClick={() => setAccountOpen(false)}
                className="flex items-center justify-between rounded-xl border border-graphite bg-abyss px-4 py-3 text-sm transition hover:border-violet/50"
              >
                <span className="inline-flex items-center gap-2">
                  <Heart size={15} className="text-mist" /> Saved items
                </span>
                <span className="text-mist">{favorites.length}</span>
              </Link>
              <Link
                to="/track-order"
                onClick={() => setAccountOpen(false)}
                className="flex items-center justify-between rounded-xl border border-graphite bg-abyss px-4 py-3 text-sm transition hover:border-violet/50"
              >
                <span className="inline-flex items-center gap-2">
                  <Package size={15} className="text-mist" /> Track an order
                </span>
                <span className="text-mist">→</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                setAccountOpen(false);
              }}
              className="btn-outline btn-sm mt-6 w-full"
            >
              <LogOut size={15} /> Sign out
            </button>
            <p className="mt-3 text-xs leading-relaxed text-mist/80">
              Saved items in this browser are merged into your account when you sign in.
            </p>
          </div>
        ) : (
          <div>
            <p className="label-xs">Account</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-mist">
              Browsing, the cart and saved items all work without an account. Signing in keeps
              your saved items with your email address.
            </p>

            <div
              className="mt-5 flex gap-1 rounded-full border border-graphite bg-abyss p-1"
              role="tablist"
              aria-label="Sign in or register"
            >
              {(['signin', 'register'] as Mode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => setMode(value)}
                  className={`flex-1 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest transition ${
                    mode === value ? 'bg-violet text-white' : 'text-mist hover:text-ink'
                  }`}
                >
                  {value === 'signin' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              {mode === 'register' ? (
                <div>
                  <label className="field-label" htmlFor="account-name">
                    Name
                  </label>
                  <input
                    id="account-name"
                    className="field"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Alex Rivera"
                  />
                </div>
              ) : null}
              <div>
                <label className="field-label" htmlFor="account-email">
                  Email
                </label>
                <input
                  id="account-email"
                  type="email"
                  required
                  className="field"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="account-password">
                  Password
                </label>
                <input
                  id="account-password"
                  type="password"
                  required
                  minLength={8}
                  className="field"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="At least 8 characters"
                />
              </div>

              {error ? (
                <p
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in to your account' : 'Create account'}
              </button>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-mist/80">
              Email and password only — no social sign-in is configured for this store. Passwords
              are stored as salted scrypt hashes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
