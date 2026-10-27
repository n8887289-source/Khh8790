import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';
import { HeartIcon, CartIcon, CheckIcon } from '../lib/icons';
import { StarRating } from './ui/StarRating';
import { classNames, formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

type Props = {
  product: Product;
  /** Called after a successful add so the host can open the cart. */
  onAdded?: () => void;
  eager?: boolean;
};

export function ProductCard({ product, onAdded, eager }: Props) {
  const cart = useCart();
  const favorites = useFavorites();
  const { notify } = useToast();
  const saved = favorites.has(product.slug);
  const inCart = cart.quantityOf(product.slug);

  const toggleFavorite = () => {
    const nowSaved = favorites.toggle(product.slug);
    notify({
      tone: 'success',
      title: nowSaved ? 'Saved to favourites' : 'Removed from favourites',
      description: `${product.name} ${nowSaved ? 'is now in' : 'has been removed from'} your favourites.`,
    });
  };

  const addToCart = () => {
    cart.add(product, 1);
    notify({
      tone: 'success',
      title: 'Added to cart',
      description: `${product.name} is in your cart.`,
    });
    onAdded?.();
  };

  return (
    <article className="surface group relative flex flex-col overflow-hidden transition duration-300 hover:border-white/20">
      <div className="relative">
        <Link
          to={`/product/${product.slug}`}
          className="block aspect-square overflow-hidden bg-navy"
          aria-label={`View ${product.name}`}
        >
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={`${product.name} — ${product.tagline}`}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              width="600"
              height="600"
            />
          ) : null}
        </Link>

        {product.badge ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper backdrop-blur">
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
          className={classNames(
            'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-ink/70 backdrop-blur transition hover:border-white/40',
            saved ? 'text-brand-soft' : 'text-paper',
          )}
        >
          <HeartIcon size={15} filled={saved} />
        </button>

        {!product.inStock ? (
          <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-ink/85 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-mute backdrop-blur">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div>
          <h3 className="text-[12.5px] font-semibold leading-snug">
            <Link to={`/product/${product.slug}`} className="link-underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[11px] leading-snug text-mute">{product.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[10.5px] font-medium tabular-nums text-paper/80">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-mute">({product.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-[14px] font-semibold tabular-nums">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={addToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={classNames(
              'relative inline-flex h-8 w-8 items-center justify-center rounded-full border transition',
              product.inStock
                ? 'border-line bg-white/[0.03] text-paper hover:border-brand hover:bg-brand hover:text-white'
                : 'cursor-not-allowed border-line text-mute opacity-50',
            )}
          >
            {inCart && product.inStock ? (
              <CheckIcon size={15} className="text-brand-soft" />
            ) : (
              <CartIcon size={15} />
            )}
            {inCart ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {inCart}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </article>
  );
}
