import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useStore } from '../store/StoreContext';
import { ProductBadge, RatingLine } from './ui';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const favorite = isFavorite(product.slug);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-graphite bg-abyss/70 transition duration-300 hover:border-violet/40 hover:bg-abyss">
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-midnight"
        aria-label={`View ${product.name}`}
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} — ${product.subtitle}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
          />
        </div>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-void/10 to-transparent" />
      </Link>

      <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
        {product.badge ? <ProductBadge label={product.badge} /> : null}
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(product)}
        aria-pressed={favorite}
        aria-label={
          favorite ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`
        }
        className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
          favorite
            ? 'border-violet/60 bg-violet/25 text-white'
            : 'border-graphite/80 bg-void/50 text-ink hover:border-violet/60 hover:text-white'
        }`}
      >
        <Heart size={15} className={favorite ? 'fill-current' : ''} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-medium leading-snug text-ink transition hover:text-white"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-mist">{product.subtitle}</p>
        <RatingLine className="mt-2" rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-graphite/70 pt-3">
          <span className="text-[15px] font-semibold text-ink">
            {formatPrice(product.priceCents)}
          </span>
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-graphite text-ink transition hover:border-violet hover:bg-violet/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={15} />
          </button>
        </div>

        {!product.inStock ? (
          <p className="mt-2 text-[11px] uppercase tracking-widest text-mist">Out of stock</p>
        ) : product.stock <= 5 ? (
          <p className="mt-2 text-[11px] uppercase tracking-widest text-sonic-soft">
            Only {product.stock} left
          </p>
        ) : null}
      </div>
    </article>
  );
}
