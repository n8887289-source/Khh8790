import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { useBodyLock, useDebounced, useEscapeKey } from '../lib/hooks';
import { useStore } from '../store/StoreContext';

const SUGGESTED = ['headphones', 'earbuds', 'speakers', 'amplifiers', 'accessories'];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, catalog } = useStore();
  const [term, setTerm] = useState('');
  const debounced = useDebounced(term, 180);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useBodyLock(searchOpen);
  useEscapeKey(searchOpen, () => setSearchOpen(false));

  useEffect(() => {
    if (!searchOpen) return undefined;
    setTerm('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  const results = useMemo(() => {
    const query = debounced.trim().toLowerCase();
    if (!query) return [];
    return catalog
      .filter((product) =>
        [product.name, product.subtitle, product.description, product.categoryName, product.category]
          .join(' ')
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 6);
  }, [catalog, debounced]);

  if (!searchOpen) return null;

  const goToResults = (value: string) => {
    const query = value.trim();
    if (!query) return;
    navigate(`/shop?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search products">
      <div
        className="absolute inset-0 bg-void/85 backdrop-blur-md"
        onClick={() => setSearchOpen(false)}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto border-b border-graphite bg-midnight/98">
        <div className="shell py-6">
          <form onSubmit={(event) => { event.preventDefault(); goToResults(term); }} role="search">
            <div className="flex items-center gap-3 border-b border-graphite pb-4">
              <Search size={20} className="text-mist" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search headphones, earbuds, speakers…"
                aria-label="Search products"
                className="w-full bg-transparent text-lg text-ink placeholder:text-mist/60 focus:outline-none sm:text-xl"
              />
              <button
                type="button"
                className="icon-btn"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </form>

          {results.length > 0 ? (
            <ul className="mt-5 divide-y divide-graphite">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-4 py-3 transition hover:bg-white/[0.03]"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-graphite object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {product.name}
                      </span>
                      <span className="block truncate text-xs text-mist">
                        {product.categoryName} · {product.subtitle}
                      </span>
                    </span>
                    <span className="text-sm text-ink">{formatPrice(product.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5">
              <p className="label-xs mb-3">
                {debounced.trim() ? 'No matches yet' : 'Popular categories'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(debounced.trim() ? SUGGESTED : SUGGESTED).map((slug) => (
                  <Link
                    key={slug}
                    to={`/shop?category=${slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="chip capitalize transition hover:border-violet/60 hover:text-ink"
                  >
                    {slug}
                  </Link>
                ))}
              </div>
              {debounced.trim() && results.length === 0 ? (
                <p className="mt-4 text-sm text-mist">
                  Nothing matched “{debounced.trim()}”. Try a shorter word, or browse the full
                  catalog.
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-graphite pt-4 text-xs text-mist">
            <span>Search by name, category or description.</span>
            <button
              type="button"
              onClick={() => goToResults(term || ' ')}
              className="inline-flex items-center gap-1.5 transition hover:text-ink"
            >
              See all results <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
