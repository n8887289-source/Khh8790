import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, type Category } from '../lib/api';
import { Reveal, SectionHeading } from '../components/ui';

const GRID_ORDER = ['headphones', 'earbuds', 'speakers', 'amplifiers'];

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .categories()
      .then(({ categories: rows }) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = GRID_ORDER.map((slug) => categories.find((item) => item.slug === slug)).filter(
    (item): item is Category => Boolean(item),
  );

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Find your sound"
          title="Shop by Category"
          action="View All"
          actionTo="/shop"
        />

        {failed ? (
          <p className="mt-8 text-sm text-mist">
            Categories could not be loaded. Please refresh, or browse the full catalog.
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((category, index) => (
            <Reveal key={category.slug} delay={index * 70}>
              <Link
                to={`/shop?category=${category.slug}`}
                className="group relative flex h-full min-h-[15rem] flex-col justify-end overflow-hidden rounded-2xl border border-graphite bg-midnight sm:min-h-[22rem]"
              >
                <img
                  src={category.image}
                  alt={`${category.name} — ${category.tagline}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-[900ms] ease-out group-hover:scale-[1.07] group-hover:opacity-95"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-transparent" />
                <span className="relative flex items-end justify-between gap-3 p-4 sm:p-5">
                  <span>
                    <span className="block text-base font-semibold sm:text-lg">
                      {category.name}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-mist sm:text-xs">
                      {category.tagline}
                    </span>
                  </span>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-graphite bg-void/60 text-ink transition group-hover:border-violet group-hover:bg-violet">
                    <ArrowRight size={15} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-xs text-mist">
          Looking for cables, cases and stands?{' '}
          <Link to="/shop?category=accessories" className="text-ink underline decoration-graphite underline-offset-4 transition hover:decoration-violet">
            Browse accessories
          </Link>
        </p>
      </div>
    </section>
  );
}
