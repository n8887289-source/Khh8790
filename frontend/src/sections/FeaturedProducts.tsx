import { useEffect, useState } from 'react';
import { api, type Product } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, ProductCardSkeleton, Reveal, SectionHeading } from '../components/ui';

const TABS = [
  { id: 'bestsellers', label: 'Best Sellers', query: { tab: 'bestsellers' } },
  { id: 'new', label: 'New Arrivals', query: { tab: 'new', sort: 'newest' } },
  { id: 'premium', label: 'Premium', query: { tab: 'premium', sort: 'price-desc' } },
];

type TabId = (typeof TABS)[number]['id'];

export function FeaturedProducts() {
  const [tab, setTab] = useState<TabId>('bestsellers');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const config = TABS.find((item) => item.id === tab) ?? TABS[0];
    let cancelled = false;
    setLoading(true);
    setError(false);
    api
      .products({ ...config.query, limit: 12 })
      .then(({ products: rows }) => {
        if (!cancelled) setProducts(rows);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Studio picks"
          title="Featured Products"
          action="View All"
          actionTo="/shop"
        />

        <div
          className="mt-8 flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Featured product collections"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition ${
                tab === item.id
                  ? 'border-violet bg-violet text-white'
                  : 'border-graphite text-mist hover:border-violet/50 hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : products.map((product, index) => (
                <Reveal key={product.slug} delay={Math.min(index * 50, 250)}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>

        {!loading && !error && products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Nothing in this collection yet"
              description="This demo collection is empty right now. Browse the full catalog to see every product."
              actionLabel="Browse all products"
              actionTo="/shop"
            />
          </div>
        ) : null}

        {error ? (
          <p className="mt-8 text-sm text-mist">
            The product feed could not be loaded. Check that the API service is running, then
            refresh.
          </p>
        ) : null}

        <p className="mt-8 text-xs leading-relaxed text-mist/80">
          Sample demonstration data — product names, prices, ratings and review counts are invented
          demo-store content, not real-world products or verified customer reviews.
        </p>
      </div>
    </section>
  );
}
