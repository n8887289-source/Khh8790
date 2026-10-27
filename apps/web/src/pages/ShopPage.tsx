import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/Feedback';
import { Reveal } from '../components/ui/Reveal';
import { SearchIcon, SlidersIcon } from '../lib/icons';
import { cn } from '../lib/cn';
import type { ProductQuery } from '../lib/types';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4.0 and up' },
  { value: '4.5', label: '4.5 and up' },
  { value: '4.8', label: '4.8 and up' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Any availability' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
];

const TAB_LABELS: Record<string, string> = {
  bestseller: 'Best Sellers',
  new: 'New Arrivals',
  premium: 'Premium',
};

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(params.get('search') ?? '');

  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const rating = params.get('rating') ?? '';
  const availability = params.get('availability') ?? '';
  const tab = params.get('tab') ?? '';
  const sort = params.get('sort') ?? 'featured';

  // Keep the input in step with the URL (nav links set ?search= directly).
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const query: ProductQuery = useMemo(
    () => ({ search, category, minPrice, maxPrice, rating, availability, tab, sort }),
    [search, category, minPrice, maxPrice, rating, availability, tab, sort],
  );

  const { data, loading, error, retry } = useAsync(JSON.stringify(query), () => api.products(query));

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const activeCategory = categories.find((item) => item.slug === category);
  const activeFilters = [
    search && { label: `“${search}”`, clear: () => update({ search: '' }) },
    activeCategory && { label: activeCategory.name, clear: () => update({ category: '' }) },
    minPrice && { label: `From $${minPrice}`, clear: () => update({ minPrice: '' }) },
    maxPrice && { label: `Up to $${maxPrice}`, clear: () => update({ maxPrice: '' }) },
    rating && { label: `${rating}★ and up`, clear: () => update({ rating: '' }) },
    availability && {
      label: availability === 'in-stock' ? 'In stock' : 'Out of stock',
      clear: () => update({ availability: '' }),
    },
    tab && { label: TAB_LABELS[tab] ?? tab, clear: () => update({ tab: '' }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const products = data?.products ?? [];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="shell py-10 sm:py-14">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">The collection</p>
        <h1 className="mt-3 text-[32px] sm:text-[44px]">
          {activeCategory ? activeCategory.name : TAB_LABELS[tab] ?? 'All Products'}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] text-mute">
          {activeCategory
            ? activeCategory.tagline
            : 'Every SONIQUE product — headphones, earbuds, speakers, amplifiers and accessories.'}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Filters */}
        <div>
          <button
            type="button"
            className="btn btn-outline w-full lg:hidden"
            aria-expanded={filtersOpen}
            aria-controls="shop-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersIcon size={16} />
            {filtersOpen ? 'Hide filters' : 'Filters'}
            {activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
          </button>

          <div
            id="shop-filters"
            className={cn(
              'mt-4 space-y-6 lg:mt-0 lg:block',
              filtersOpen ? 'block' : 'hidden',
            )}
          >
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                update({ search: searchDraft.trim() });
              }}
            >
              <label htmlFor="shop-search" className="eyebrow">
                Search
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="shop-search"
                  type="search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Name, category, description"
                  className="field"
                />
                <button type="submit" className="btn btn-outline px-3.5" aria-label="Search">
                  <SearchIcon size={16} />
                </button>
              </div>
            </form>

            <div>
              <p className="eyebrow">Category</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => update({ category: '' })}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-[13px] transition',
                      category === '' ? 'bg-brand/15 text-paper' : 'text-mute hover:bg-white/[0.05]',
                    )}
                    aria-pressed={category === ''}
                  >
                    All categories
                  </button>
                </li>
                {categories.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onClick={() => update({ category: item.slug })}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-[13px] transition',
                        category === item.slug
                          ? 'bg-brand/15 text-paper'
                          : 'text-mute hover:bg-white/[0.05]',
                      )}
                      aria-pressed={category === item.slug}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">Price</p>
              <div className="mt-3 flex items-center gap-2">
                <label className="sr-only" htmlFor="min-price">
                  Minimum price
                </label>
                <input
                  id="min-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => update({ minPrice: event.target.value })}
                  placeholder="Min"
                  className="field"
                />
                <span className="text-mute" aria-hidden="true">
                  –
                </span>
                <label className="sr-only" htmlFor="max-price">
                  Maximum price
                </label>
                <input
                  id="max-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(event) => update({ maxPrice: event.target.value })}
                  placeholder="Max"
                  className="field"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: 'Under $150', min: '', max: '150' },
                  { label: '$150–$350', min: '150', max: '350' },
                  { label: '$350+', min: '350', max: '' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => update({ minPrice: preset.min, maxPrice: preset.max })}
                    className="rounded-full border border-line px-3 py-1.5 text-[11.5px] text-mute transition hover:border-white/25 hover:text-paper"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rating-filter" className="eyebrow">
                Rating
              </label>
              <select
                id="rating-filter"
                value={rating}
                onChange={(event) => update({ rating: event.target.value })}
                className="field mt-2"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-navy">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="availability-filter" className="eyebrow">
                Availability
              </label>
              <select
                id="availability-filter"
                value={availability}
                onChange={(event) => update({ availability: event.target.value })}
                className="field mt-2"
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-navy">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="eyebrow">Collections</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => update({ tab: '' })}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-[13px] transition',
                      tab === '' ? 'bg-brand/15 text-paper' : 'text-mute hover:bg-white/[0.05]',
                    )}
                    aria-pressed={tab === ''}
                  >
                    Everything
                  </button>
                </li>
                {Object.entries(TAB_LABELS).map(([value, label]) => (
                  <li key={value}>
                    <button
                      type="button"
                      onClick={() => update({ tab: value })}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-[13px] transition',
                        tab === value ? 'bg-brand/15 text-paper' : 'text-mute hover:bg-white/[0.05]',
                      )}
                      aria-pressed={tab === value}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {hasFilters ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
              >
                Clear all filters
              </Button>
            ) : null}
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-[13px] text-mute" role="status" aria-live="polite">
              {loading
                ? 'Loading products…'
                : `${products.length} product${products.length === 1 ? '' : 's'}`}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-[12.5px] text-mute">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => update({ sort: event.target.value })}
                className="field w-auto py-2"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-navy">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFilters.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <li key={filter.label}>
                  <button
                    type="button"
                    onClick={filter.clear}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-paper transition hover:border-white/30"
                  >
                    {filter.label}
                    <span aria-hidden="true" className="text-mute">
                      ×
                    </span>
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6">
            {error ? (
              <ErrorState
                description="We could not load the catalogue. The store service may still be starting up."
                onRetry={retry}
              />
            ) : loading ? (
              <LoadingGrid count={9} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products match those filters"
                description="Try widening the price range, choosing another category, or clearing the filters to see the whole collection."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((product, index) => (
                  <Reveal as="li" key={product.slug} delay={Math.min(index, 6) * 35}>
                    <ProductCard product={product} eager={index < 4} />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>

          {!loading && !error && products.length > 0 ? (
            <p className="mt-8 text-[11.5px] text-mute/80">
              Ratings and review counts are sample data included with this demonstration catalogue.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
