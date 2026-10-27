import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { SectionHeading, LoadingGrid, ErrorState } from '../ui/Feedback';
import { Reveal } from '../ui/Reveal';
import { ArrowUpRightIcon } from '../../lib/icons';

/** Four equal-width photographic category cards, as in the reference layout. */
const FEATURED_CATEGORIES = ['headphones', 'earbuds', 'speakers', 'amplifiers'];

export function CategoryGrid() {
  const { categories, error } = useCategories();
  const shown = FEATURED_CATEGORIES.map((slug) =>
    categories.find((category) => category.slug === slug),
  ).filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <section className="shell py-10 sm:py-14" aria-labelledby="categories-title">
      <SectionHeading
        eyebrow="Explore"
        title="Shop by Category"
        titleId="categories-title"
        actionLabel="View All"
        actionTo="/shop"
      />

      <div className="mt-5">
        {error ? (
          <ErrorState description="We could not load the categories just now. Please refresh the page to try again." />
        ) : shown.length === 0 ? (
          <LoadingGrid count={4} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {shown.map((category, index) => (
              <Reveal as="li" key={category.slug} delay={index * 60}>
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group relative block overflow-hidden rounded-xl border border-line bg-navy"
                  aria-label={`Shop ${category.name} — ${category.tagline}`}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5]">
                    <img
                      src={category.image}
                      alt={`${category.name} — ${category.tagline}`}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold leading-tight sm:text-[17px]">
                        {category.name}
                      </h3>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-mute">
                        {category.tagline}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-ink/60 text-paper backdrop-blur transition group-hover:border-brand group-hover:bg-brand"
                    >
                      <ArrowUpRightIcon size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
