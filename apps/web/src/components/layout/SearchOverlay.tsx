import { useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import type { Product } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { SpinnerIcon } from '../../lib/icons';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();
  const inputId = useId();

  useEffect(() => {
    if (!open) return;
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      api
        .products({ search: trimmed })
        .then((data) => {
          if (!active) return;
          setResults(data.products.slice(0, 6));
          setFailed(false);
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setFailed(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [term, open]);

  const goToResults = () => {
    const trimmed = term.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : '/shop');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search"
      hideTitle
      className="max-w-2xl"
      labelledBy="search-dialog-title"
    >
      <h2 id="search-dialog-title" className="sr-only">
        Search products
      </h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToResults();
        }}
        role="search"
      >
        <label htmlFor={inputId} className="eyebrow">
          Search the collection
        </label>
        <input
          id={inputId}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Headphones, Buds Pro, amplifier…"
          className="field mt-3 text-base"
          autoComplete="off"
        />
      </form>

      <div className="mt-5 min-h-[8rem]">
        {loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-mute">
            <SpinnerIcon size={16} /> Searching…
          </p>
        ) : failed ? (
          <p className="py-6 text-sm text-mute">
            Search is unavailable right now. Please try again in a moment.
          </p>
        ) : term.trim() === '' ? (
          <p className="py-6 text-sm text-mute">
            Search by product name, category or description.
          </p>
        ) : results.length === 0 ? (
          <p className="py-6 text-sm text-mute">
            No products match “{term.trim()}”. Try a different word.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {results.map((product) => (
              <li key={product.slug}>
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/[0.05]"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{product.name}</span>
                    <span className="block text-[12px] text-mute">
                      {product.categoryName} · {product.tagline}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="text-[12px] text-mute">
          {results.length > 0 ? `Showing ${results.length} of the closest matches` : 'Press Enter to browse all results'}
        </p>
        <Button size="sm" variant="outline" onClick={goToResults}>
          View all results
        </Button>
      </div>
    </Modal>
  );
}
