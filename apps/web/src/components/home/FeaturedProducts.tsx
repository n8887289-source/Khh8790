import { useState } from 'react';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { ProductCard } from '../ProductCard';
import { SectionHeading, LoadingGrid, ErrorState, EmptyState } from '../ui/Feedback';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/cn';

const TABS = [
  { id: 'bestseller', label: 'Best Sellers' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'premium', label: 'Premium' },
];

export function FeaturedProducts() {
  const [tab, setTab] = useState('bestseller');
  const { data, loading, error, retry } = useAsync(`featured:${tab}`, () =>
    api.products({ tab, sort: 'rating' }),
  );

  const products = (data?.products ?? []).slice(0, 6);

  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="featured-title">
      <SectionHeading
        eyebrow="The collection"
        title="Featured Products"
        titleId="featured-title"
        actionLabel="View All"
        actionTo="/shop"
      />

      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Product collections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-[12.5px] font-medium transition',
              tab === item.id
                ? 'border-brand bg-brand/15 text-paper'
                : 'border-line text-mute hover:border-white/25 hover:text-paper',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-7">
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
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {products.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 40}>
                <ProductCard product={product} eager={index < 2} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-[11.5px] text-mute/80">
        Ratings and review counts are sample data included with this demonstration catalogue.
      </p>
    </section>
  );
}
