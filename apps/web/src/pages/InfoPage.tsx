import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { CONTENT_PAGES } from '../content/pages';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { NotFoundPage } from './NotFoundPage';
import { isValidEmail } from '../lib/format';
import { SpinnerIcon, CheckIcon } from '../lib/icons';

const TOPICS = [
  'General enquiry',
  'Order or delivery',
  'Returns',
  'Warranty claim',
  'Product help',
  'Press',
  'Careers',
  'Affiliates',
];

function ContactForm() {
  const [fields, setFields] = useState({
    name: '',
    email: '',
    topic: TOPICS[0],
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (fields.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!isValidEmail(fields.email)) next.email = 'Please enter a valid email address.';
    if (fields.message.trim().length < 10) next.message = 'Please add a little more detail.';
    setErrors(next);
    if (Object.keys(next).length) {
      setResult({ tone: 'error', message: 'Please check the highlighted fields.' });
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      const response = await api.contact(fields);
      setResult({ tone: 'success', message: response.message });
      setFields({ name: '', email: '', topic: TOPICS[0], message: '' });
    } catch (error) {
      setResult({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Your message could not be sent.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="surface mt-8 space-y-5 p-6 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="eyebrow">
            Name <span className="text-brand-soft">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={fields.name}
            onChange={(event) => setFields((current) => ({ ...current, name: event.target.value }))}
            className={`field mt-2 ${errors.name ? 'field-error' : ''}`}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
          />
          {errors.name ? (
            <p role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="eyebrow">
            Email <span className="text-brand-soft">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={fields.email}
            onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))}
            className={`field mt-2 ${errors.email ? 'field-error' : ''}`}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
          {errors.email ? (
            <p role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="eyebrow">
          Topic
        </label>
        <select
          id="contact-topic"
          value={fields.topic}
          onChange={(event) => setFields((current) => ({ ...current, topic: event.target.value }))}
          className="field mt-2"
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic} className="bg-navy">
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="eyebrow">
          Message <span className="text-brand-soft">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={fields.message}
          onChange={(event) => setFields((current) => ({ ...current, message: event.target.value }))}
          className={`field mt-2 resize-y ${errors.message ? 'field-error' : ''}`}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? (
          <p role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? (
          <>
            <SpinnerIcon size={16} /> Sending…
          </>
        ) : (
          'Send message'
        )}
      </Button>

      <p
        role="status"
        aria-live="polite"
        className={`min-h-[1.25rem] text-[12.5px] ${
          result?.tone === 'error' ? 'text-[#ff8b8b]' : 'text-brand-soft'
        }`}
      >
        {result ? (
          <span className="inline-flex items-start gap-1.5">
            {result.tone === 'success' ? <CheckIcon size={14} className="mt-0.5" /> : null}
            {result.message}
          </span>
        ) : null}
      </p>
    </form>
  );
}

export function InfoPage() {
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, '');
  const page = CONTENT_PAGES[key];

  if (!page) return <NotFoundPage />;

  return (
    <div className="shell py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 className="mt-4 text-[32px] sm:text-[44px]">{page.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-mute">{page.intro}</p>

        {page.variant === 'contact' ? <ContactForm /> : null}

        {page.variant === 'faq' ? (
          <div className="mt-10 divide-y divide-[#292b38] border-y border-line">
            {page.sections.map((section) => (
              <details key={section.heading} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-medium">
                  {section.heading}
                  <span
                    aria-hidden="true"
                    className="text-mute transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-mute">
                  {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold sm:text-2xl">{section.heading}</h2>
                <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-mute">
                  {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets ? (
                    <ul className="space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        )}

        {page.cta ? (
          <div className="mt-12 border-t border-line pt-8">
            <Button to={page.cta.to} size="lg">
              {page.cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
