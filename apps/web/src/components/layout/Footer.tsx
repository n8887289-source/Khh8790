import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  FacebookIcon,
  InstagramIcon,
  LeafIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '../../lib/icons';

/**
 * Social channels are not configured for this demonstration build, so the marks
 * are presentational only — no dead links are rendered.
 */
const SOCIALS = [
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'YouTube', icon: YouTubeIcon },
  { label: 'TikTok', icon: TikTokIcon },
  { label: 'X', icon: XIcon },
  { label: 'Facebook', icon: FacebookIcon },
];

const COLUMNS = [
  {
    heading: 'Shop',
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
    heading: 'Support',
    links: [
      { label: 'Track Order', to: '/support/track-order' },
      { label: 'Returns & Exchanges', to: '/support/returns' },
      { label: 'Warranty', to: '/support/warranty' },
      { label: 'Product Help', to: '/support/product-help' },
      { label: 'Contact Us', to: '/support/contact' },
      { label: 'FAQs', to: '/support/faqs' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Our Story', to: '/story' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Press', to: '/press' },
      { label: 'Careers', to: '/careers' },
      { label: 'Affiliates', to: '/affiliates' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy">
      <div className="shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.6fr]">
          <div>
            <Link
              to="/"
              className="text-lg font-semibold uppercase tracking-[0.34em] text-paper"
              aria-label="SONIQUE home"
            >
              Sonique
            </Link>
            <p className="mt-4 max-w-xs text-sm text-mute">Sound for a brighter you.</p>
            <ul className="mt-5 flex items-center gap-2" aria-label="SONIQUE social channels">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <span
                    title={`${social.label} — link not configured yet`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute"
                  >
                    <social.icon size={16} />
                    <span className="sr-only">{social.label}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-sm text-[12.5px] leading-relaxed text-mute/80">
              This is a demonstration storefront. Products, ratings, reviews and testimonials are
              sample content created for the build.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="eyebrow mb-4">{column.heading}</h2>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-[13.5px] text-mute transition hover:text-paper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="surface relative mt-10 flex flex-col gap-5 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div
            aria-hidden="true"
            className="glow-violet pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-40"
          />
          <div className="relative flex items-start gap-4">
            <span
              aria-hidden="true"
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-brand-soft sm:inline-flex"
            >
              <LeafIcon size={20} />
            </span>
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">Join a Louder Tomorrow</h2>
              <p className="mt-2 text-sm text-mute">
                Better sound. A brighter, more connected world.
              </p>
            </div>
          </div>
          <Link to="/sustainability" className="btn btn-outline self-start sm:self-auto">
            Our Impact
            <ArrowUpRightIcon size={16} />
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-5 text-[12px] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SONIQUE. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="transition hover:text-paper">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-paper">
              Terms of Service
            </Link>
            <Link to="/cookies" className="transition hover:text-paper">
              Cookie Preferences
            </Link>
            <Link to="/admin" className="transition hover:text-paper">
              Store Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
