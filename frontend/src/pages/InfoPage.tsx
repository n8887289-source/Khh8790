import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Package } from 'lucide-react';
import { INFO_PAGES } from '../content/infoPages';

export default function InfoPage({ slug }: { slug: string }) {
  const page = INFO_PAGES[slug];
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [token, setToken] = useState('');

  if (!page) {
    return (
      <div className="shell py-20">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <Link to="/" className="btn-outline btn-sm mt-6">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / {page.title}
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="label-xs">{page.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">{page.title}</h1>
        <p className="mt-5 text-sm leading-relaxed text-mist sm:text-base">{page.intro}</p>
      </header>

      {slug === 'track-order' ? (
        <form
          className="mt-10 grid max-w-2xl gap-4 rounded-2xl border border-graphite bg-abyss/50 p-6 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!orderNumber.trim() || !token.trim()) return;
            navigate(
              `/order/${encodeURIComponent(orderNumber.trim())}?token=${encodeURIComponent(token.trim())}`,
            );
          }}
        >
          <div>
            <label className="field-label" htmlFor="track-number">
              Order number
            </label>
            <input
              id="track-number"
              className="field"
              placeholder="SON-2026-1A2B3C"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="track-token">
              Lookup token
            </label>
            <input
              id="track-token"
              className="field"
              placeholder="From your confirmation link"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary btn-sm">
              <Package size={15} /> View order
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-12 grid max-w-4xl gap-10">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-mist">
                {paragraph}
              </p>
            ))}
            {section.list ? (
              <ul className="mt-4 space-y-2">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-mist">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {page.channels && page.channels.length > 0 ? (
        <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          {page.channels.map((channel) => (
            <a
              key={channel.value}
              href={channel.href}
              className="flex items-center justify-between gap-4 rounded-2xl border border-graphite bg-abyss/50 px-5 py-4 transition hover:border-violet/50"
            >
              <span>
                <span className="label-xs block">{channel.label}</span>
                <span className="mt-1 block text-sm text-ink">{channel.value}</span>
              </span>
              <Mail size={17} className="text-violet-soft" />
            </a>
          ))}
        </div>
      ) : null}

      {page.cta ? (
        <div className="mt-12">
          <Link to={page.cta.to} className="btn-primary">
            {page.cta.label}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : null}

      {page.notice ? (
        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-mist/70">{page.notice}</p>
      ) : null}
    </div>
  );
}
