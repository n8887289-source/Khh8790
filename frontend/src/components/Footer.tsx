import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Headphones', to: '/shop?category=headphones' },
      { label: 'Earbuds', to: '/shop?category=earbuds' },
      { label: 'Speakers', to: '/shop?category=speakers' },
      { label: 'Amplifiers', to: '/shop?category=amplifiers' },
      { label: 'Accessories', to: '/shop?category=accessories' },
      { label: 'Gift Cards', to: '/gift-cards' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Track Order', to: '/track-order' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Warranty', to: '/warranty' },
      { label: 'Product Help', to: '/product-help' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQs', to: '/faq' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/our-story' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Press', to: '/press' },
      { label: 'Careers', to: '/careers' },
      { label: 'Affiliates', to: '/affiliates' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-graphite bg-midnight">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <Link
            to="/"
            className="text-lg font-semibold uppercase tracking-[0.42em] text-ink transition hover:text-white"
          >
            Sonique
          </Link>
          <p className="mt-4 max-w-xs text-sm text-mist">Sound for a brighter you.</p>
          <p className="mt-6 text-xs leading-relaxed text-mist/70">
            Social channels are not configured for this store yet, so no follow links are shown
            here — they appear once official destinations exist.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="label-xs mb-4">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-mist transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="label-xs mb-4">Join a Louder Tomorrow</h2>
            <p className="text-sm leading-relaxed text-mist">
              Better sound. A brighter, more connected world.
            </p>
            <Link to="/sustainability" className="btn-primary btn-sm mt-4">
              Our Impact
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-graphite">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SONIQUE. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy" className="transition hover:text-ink">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-ink">
              Terms of Service
            </Link>
            <Link to="/cookie-preferences" className="transition hover:text-ink">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
