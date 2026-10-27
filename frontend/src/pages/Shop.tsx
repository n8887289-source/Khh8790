import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api, type Category, type Product } from '../lib/api';
import { useBodyLock, useDebounced, useEscapeKey } from '../lib/hooks';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, ProductCardSkeleton, Reveal } from '../components/ui';

type Filters = {
  q: string;
  category: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  inStock: boolean;
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
];

const RATING_OPTIONS = [
  { value: '0', label: 'Any rating' },
  { value: '4', label: '4.0 and up' },
  { value: '4.5', label: '4.5 and up' },
];

const EMPTY: Filters = {
  q: '',
  category: 'all',
  sort: 'featured',
  minPrice: '',
  maxPrice: '',
  minRating: '0',
  inStock: false,
};

function fromParams(params: URLSearchParams): Filters {
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    sort: params.get('sort') ?? 'featured',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    minRating: params.get('minRating') ?? '0',
    inStock: params.get('inStock') === '1',
  };
}

export default function Shop() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(params));
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useBodyLock(sheetOpen);
  useEscapeKey(sheetOpen, () => setSheetOpen(false));

  // Navigation links (e.g. "Speakers" in the header) drive the URL; mirror it into state.
  const paramKey = params.toString();
  useEffect(() => {
    setFilters(fromParams(new URLSearchParams(paramKey)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  useEffect(() => {
    let cancelled = false;
    api
      .categories()
      .then(({ categories: rows }) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const debounced = useDebounced(filters, 240);
  const queryKey = JSON.stringify(debounced);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .products({
        q: debounced.q || undefined,
        category: debounced.category === 'all' ? undefined : debounced.category,
        sort: debounced.sort,
        minPrice: debounced.minPrice || undefined,
        maxPrice: debounced.maxPrice || undefined,
        minRating: debounced.minRating === '0' ? undefined : debounced.minRating,
        inStock: debounced.inStock ? '1' : undefined,
        limit: 120,
      })
      .then(({ products: rows }) => {
        if (!cancelled) setProducts(rows);
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setProducts([]);
          setError(
            fetchError instanceof Error ? fetchError.message : 'Products could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const activeCategory = categories.find((item) => item.slug === filters.category);

  const heading = filters.q
    ? `Results for “${filters.q}”`
    : activeCategory
      ? activeCategory.name
      : 'All Products';

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.category !== 'all') {
      const name = categories.find((item) => item.slug === filters.category)?.name ?? filters.category;
      chips.push({ label: `Category: ${name}`, clear: () => setFilters((f) => ({ ...f, category: 'all' })) });
    }
    if (filters.q) chips.push({ label: `Search: ${filters.q}`, clear: () => setFilters((f) => ({ ...f, q: '' })) });
    if (filters.minPrice) chips.push({ label: `Min $${filters.minPrice}`, clear: () => setFilters((f) => ({ ...f, minPrice: '' })) });
    if (filters.maxPrice) chips.push({ label: `Max $${filters.maxPrice}`, clear: () => setFilters((f) => ({ ...f, maxPrice: '' })) });
    if (filters.minRating !== '0') chips.push({ label: `Rating ${filters.minRating}+`, clear: () => setFilters((f) => ({ ...f, minRating: '0' })) });
    if (filters.inStock) chips.push({ label: 'In stock only', clear: () => setFilters((f) => ({ ...f, inStock: false })) });
    if (filters.sort !== 'featured') {
      const label = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? filters.sort;
      chips.push({ label: `Sort: ${label}`, clear: () => setFilters((f) => ({ ...f, sort: 'featured' })) });
    }
    return chips;
  }, [filters, categories]);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      categories={categories}
      onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
      onClear={() => setFilters({ ...EMPTY })}
    />
  );

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Shop
        {activeCategory ? ` / ${activeCategory.name}` : ''}
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">{heading}</h1>
          <p className="mt-3 text-sm text-mist">
            {loading
              ? 'Loading products…'
              : `${products.length} product${products.length === 1 ? '' : 's'}${
                  activeCategory ? ` in ${activeCategory.name}` : ''
                }`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-outline btn-sm lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal size={15} /> Filters
            {activeChips.length > 0 ? <span className="text-violet-soft">{activeChips.length}</span> : null}
          </button>
          <label className="flex items-center gap-2 text-xs text-mist">
            <span className="hidden sm:inline">Sort</span>
            <select
              id="filter-sort"
              value={filters.sort}
              onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
              className="rounded-full border border-graphite bg-abyss px-4 py-2 text-xs text-ink focus:border-violet focus:outline-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="chip transition hover:border-violet/60 hover:text-ink"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters({ ...EMPTY })}
            className="text-xs text-mist underline decoration-graphite underline-offset-4 transition hover:text-ink"
          >
            Clear all filters
          </button>
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-graphite bg-abyss/50 p-5">
            {filterPanel}
          </div>
        </aside>

        <div>
          {error ? (
            <EmptyState
              title="Products could not be loaded"
              description={error}
              actionLabel="Reload the catalog"
              actionTo="/shop"
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match those filters"
              description="Try widening the price range, clearing the rating filter, or searching for a different word."
            >
              <button type="button" className="btn-outline btn-sm" onClick={() => setFilters({ ...EMPTY })}>
                Clear all filters
              </button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product, index) => (
                <Reveal key={product.slug} delay={Math.min(index * 40, 200)}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}

          <p className="mt-10 text-xs leading-relaxed text-mist/80">
            Sample demonstration data — ratings and review counts are invented content for this demo
            store, not verified customer reviews.
          </p>
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl border-t border-graphite bg-midnight p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-widest">Filters</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close filters"
                onClick={() => setSheetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            {filterPanel}
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => setSheetOpen(false)}>
              Show {products.length} product{products.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({
  filters,
  categories,
  onChange,
  onClear,
}: {
  filters: Filters;
  categories: Category[];
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <label className="field-label" htmlFor="filter-search">
          Search
        </label>
        <input
          id="filter-search"
          type="search"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder="Name, category, description"
          className="field"
        />
      </div>

      <fieldset>
        <legend className="field-label">Category</legend>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist transition hover:text-ink">
            <input
              type="radio"
              name="category"
              checked={filters.category === 'all'}
              onChange={() => onChange({ category: 'all' })}
              className="h-3.5 w-3.5 accent-[#6947FF]"
            />
            All categories
          </label>
          {categories.map((category) => (
            <label
              key={category.slug}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-mist transition hover:text-ink"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === category.slug}
                onChange={() => onChange({ category: category.slug })}
                className="h-3.5 w-3.5 accent-[#6947FF]"
              />
              {category.name}
              <span className="ml-auto text-xs text-mist/60">{category.productCount}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Price (USD)</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="filter-min-price">
            Minimum price
          </label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            step="10"
            inputMode="numeric"
            value={filters.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
            placeholder="Min"
            className="field"
          />
          <span className="text-mist">–</span>
          <label className="sr-only" htmlFor="filter-max-price">
            Maximum price
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            step="10"
            inputMode="numeric"
            value={filters.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            placeholder="Max"
            className="field"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Rating</legend>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-mist transition hover:text-ink"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === option.value}
                onChange={() => onChange({ minRating: option.value })}
                className="h-3.5 w-3.5 accent-[#6947FF]"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist transition hover:text-ink">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onChange({ inStock: event.target.checked })}
            className="h-3.5 w-3.5 accent-[#6947FF]"
          />
          In stock only
        </label>
      </fieldset>

      <button type="button" onClick={onClear} className="btn-outline btn-sm w-full">
        Clear all filters
      </button>
    </div>
  );
}
