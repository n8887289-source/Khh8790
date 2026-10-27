import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Reveal } from '../components/ui';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
      setStatus('error');
      setMessage('That does not look like a valid email address.');
      return;
    }

    setStatus('busy');
    try {
      const result = await api.subscribe(value);
      setStatus('success');
      setMessage(result.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'The subscription could not be saved. Please try again.',
      );
    }
  };

  return (
    <section className="section">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-graphite bg-midnight px-6 py-14 sm:px-12">
            <span className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet/25 blur-[110px]" />
            <span className="pointer-events-none absolute -left-24 -bottom-10 h-64 w-64 rounded-full bg-sonic/15 blur-[110px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="label-xs">Newsletter</p>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Be First in Line</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
                  Get exclusive offers, new product drops and audio inspiration.
                </p>
              </div>

              {/* noValidate: the custom messages below must be the ones shoppers see. */}
              <form
                onSubmit={submit}
                noValidate
                className="lg:justify-self-end lg:w-full lg:max-w-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor="newsletter-email">
                    Your email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status !== 'busy') setStatus('idle');
                    }}
                    placeholder="Your email address"
                    className="field flex-1"
                    autoComplete="email"
                    aria-invalid={status === 'error'}
                  />
                  <button type="submit" className="btn-primary shrink-0" disabled={status === 'busy'}>
                    {status === 'busy' ? 'Subscribing…' : 'Subscribe'}
                    {status === 'busy' ? null : <ArrowRight size={15} />}
                  </button>
                </div>

                <p
                  className={`mt-3 min-h-5 text-xs ${
                    status === 'error'
                      ? 'text-red-300'
                      : status === 'success'
                        ? 'text-sonic-soft'
                        : 'text-mist'
                  }`}
                  role={status === 'error' ? 'alert' : 'status'}
                >
                  {status === 'idle'
                    ? 'Subscriptions are stored in this store’s own database.'
                    : message}
                </p>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
