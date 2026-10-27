import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { isValidEmail } from '../../lib/format';
import { Button } from '../ui/Button';
import { CheckIcon, SpinnerIcon } from '../../lib/icons';

type Status = { tone: 'success' | 'error'; message: string } | null;

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus({ tone: 'error', message: 'Please enter your email address.' });
      return;
    }
    if (!isValidEmail(trimmed)) {
      setStatus({ tone: 'error', message: 'That does not look like a valid email address.' });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const result = await api.subscribe(trimmed);
      setStatus({ tone: 'success', message: result.message });
      setEmail('');
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Subscription failed. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="newsletter-title">
      <div className="surface relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="glow-violet pointer-events-none absolute -right-16 -top-24 h-80 w-80 opacity-60"
        />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="eyebrow">Newsletter</p>
          <h2 id="newsletter-title" className="mt-4 text-[28px] sm:text-4xl">
            Be First in Line
          </h2>
          <p className="mt-4 text-[14.5px] text-mute">
            Get exclusive offers, new product drops and audio inspiration.
          </p>

          <form onSubmit={submit} className="mt-7" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status) setStatus(null);
                }}
                placeholder="you@example.com"
                className={`field ${status?.tone === 'error' ? 'field-error' : ''}`}
                aria-invalid={status?.tone === 'error'}
                aria-describedby="newsletter-status"
                autoComplete="email"
              />
              <Button type="submit" disabled={busy} className="sm:w-auto">
                {busy ? (
                  <>
                    <SpinnerIcon size={15} /> Subscribing…
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </form>

          <p
            id="newsletter-status"
            role="status"
            aria-live="polite"
            className={`mt-3 min-h-[1.25rem] text-[12.5px] ${
              status?.tone === 'error' ? 'text-[#ff8b8b]' : 'text-brand-soft'
            }`}
          >
            {status ? (
              <span className="inline-flex items-center gap-1.5">
                {status.tone === 'success' ? <CheckIcon size={14} /> : null}
                {status.message}
              </span>
            ) : null}
          </p>

          <p className="mt-4 text-[11.5px] leading-relaxed text-mute/80">
            Sign-ups are stored in this store's own database so the request is real. No marketing
            email provider is connected, so no campaign email will be sent yet.
          </p>
        </div>
      </div>
    </section>
  );
}
