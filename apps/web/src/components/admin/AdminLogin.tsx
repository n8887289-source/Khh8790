import { useState, type FormEvent } from 'react';
import { AdminError, adminApi, type AdminSession } from '../../lib/adminApi';
import { Button } from '../ui/Button';
import { LockIcon } from '../../lib/icons';
import { isValidEmail } from '../../lib/format';

type Props = {
  session: AdminSession;
  onSignedIn: (session: AdminSession) => void;
};

/** One-time account creation (when the store has no administrator yet) or sign-in. */
export function AdminLogin({ session, onSignedIn }: Props) {
  const firstRun = session.configured && !session.hasAccount;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFields({});

    if (!isValidEmail(email)) {
      setFields({ email: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 10) {
      setFields({ password: 'Use a password of at least 10 characters.' });
      return;
    }

    setBusy(true);
    try {
      if (firstRun) await adminApi.setup(email, password);
      else await adminApi.login(email, password);
      onSignedIn(await adminApi.session());
    } catch (cause) {
      if (cause instanceof AdminError) {
        setError(cause.message);
        setFields(cause.fields ?? {});
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!session.configured) {
    return (
      <div className="shell max-w-[560px] py-16">
        <div className="surface p-8">
          <p className="eyebrow">Store management</p>
          <h1 className="mt-3 text-[26px]">Admin sign-in is not configured</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-mute">
            The server needs a session signing key before an administrator can sign in. Add a
            <code className="mx-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px]">SESSION_SECRET</code>
            value to this app&apos;s secrets, then reload this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shell max-w-[520px] py-14 sm:py-20">
      <div className="surface p-6 sm:p-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-brand-soft">
          <LockIcon size={18} />
        </span>
        <p className="eyebrow mt-5">Store management</p>
        <h1 className="mt-3 text-[26px] sm:text-[30px]">
          {firstRun ? 'Create the administrator account' : 'Sign in to manage SONIQUE'}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-mute">
          {firstRun
            ? 'This store has no administrator yet. The account you create here owns the catalogue, orders and newsletter list, so use a password you keep private.'
            : 'Managing products, orders and subscribers requires an administrator account. The session lasts 12 hours and is stored in a secure, HTTP-only cookie.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="admin-email" className="eyebrow">
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`field mt-2 ${fields.email ? 'field-error' : ''}`}
            />
            {fields.email ? (
              <p role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
                {fields.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="admin-password" className="eyebrow">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete={firstRun ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`field mt-2 ${fields.password ? 'field-error' : ''}`}
            />
            {fields.password ? (
              <p role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
                {fields.password}
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-[12.5px] text-[#ff8b8b]">
              {error}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={busy}>
            {busy ? 'Please wait…' : firstRun ? 'Create account' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
