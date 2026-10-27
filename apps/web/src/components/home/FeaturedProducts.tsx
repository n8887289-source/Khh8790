import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { ProductCard } from '../ProductCard';
import { SectionHeading, LoadingGrid, ErrorState, EmptyState } from '../ui/Feedback';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/cn';

const TABS = [
  /**
   * Merchandising order (sort_order): the six products the campaign leads with,
   * which is also the "Best Sellers" shelf in the reference layout.
   */
  { id: 'featured', label: 'Best Sellers', params: { sort: 'featured' } },
  { id: 'new', label: 'New Arrivals', params: { tab: 'new', sort: 'rating' } },
  { id: 'premium', label: 'Premium', params: { tab: 'premium', sort: 'rating' } },
] as const;

export function FeaturedProducts() {
  const [tab, setTab] = useState<string>('featured');
  const active = TABS.find((item) => item.id === tab) ?? TABS[0];
  const { data, loading, error, retry } = useAsync(`featured:${active.id}`, () =>
    api.products(active.params),
  );

  const products = (data?.products ?? []).slice(0, 6);

  return (
    <section className="shell py-10 sm:py-14" aria-labelledby="featured-title">
      <SectionHeading
        eyebrow="The collection"
        title="Featured Products"
        titleId="featured-title"
        actionLabel="View All"
        actionTo="/shop"
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Product collections" className="flex flex-wrap items-center gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition',
                tab === item.id
                  ? 'border-brand bg-brand/15 text-paper'
                  : 'border-line text-mute hover:border-white/25 hover:text-paper',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Link
          to="/shop"
          className="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-mute transition hover:border-white/25 hover:text-paper"
        >
          View All
        </Link>
      </div>

      <div className="mt-5">
        {error ? (
          <ErrorState
            description="The catalogue could not be loaded. The store service may still be starting."
            onRetry={retry}
          />
        ) : loading ? (
          <LoadingGrid count={6} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="This collection is empty right now. Browse the full catalogue instead."
            actionLabel="Shop all products"
            actionTo="/shop"
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 xl:grid-cols-6">
            {products.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 40}>
                <ProductCard product={product} eager={index < 2} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-5 text-[11.5px] text-mute/80">
        Ratings and review counts are sample data included with this demonstration catalogue.
      </p>
    </section>
  );
}
