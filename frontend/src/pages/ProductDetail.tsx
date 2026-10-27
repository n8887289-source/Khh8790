import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { api, type Product } from '../lib/api';
import { MAX_QUANTITY_PER_ITEM, clampQuantity, formatPrice } from '../lib/format';
import { useStore } from '../store/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, ProductBadge, RatingLine, Reveal, Spinner } from '../components/ui';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setImageIndex(0);
    setQuantity(1);
    setColorIndex(0);
    api
      .product(slug)
      .then(({ product: found, related: rows }) => {
        if (cancelled) return;
        setProduct(found);
        setRelated(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="shell py-16">
        <Spinner label="Loading product" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="We could not find that product"
          description="The link may be out of date. Browse the full catalog to find what you are looking for."
          actionLabel="Browse all products"
          actionTo="/shop"
        />
      </div>
    );
  }

  const gallery = product.images.length > 0 ? product.images : [product.image];
  const favorite = isFavorite(product.slug);
  const maxQuantity = Math.min(MAX_QUANTITY_PER_ITEM, Math.max(product.stock, 1));
  const selectedColor = product.colors[colorIndex];

  return (
    <div className="pb-20">
      <div className="shell py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="label-xs">
          <Link to="/" className="transition hover:text-ink">
            Home
          </Link>{' '}
          /{' '}
          <Link to="/shop" className="transition hover:text-ink">
            Shop
          </Link>{' '}
          /{' '}
          <Link
            to={`/shop?category=${product.category}`}
            className="transition hover:text-ink"
          >
            {product.categoryName}
          </Link>{' '}
          / <span className="text-ink/80">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-graphite bg-midnight">
              <div className="aspect-square">
                <img
                  src={gallery[imageIndex]}
                  alt={`${product.name} — view ${imageIndex + 1}`}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              </div>
              {product.badge ? (
                <span className="absolute left-4 top-4">
                  <ProductBadge label={product.badge} />
                </span>
              ) : null}
            </div>

            {gallery.length > 1 ? (
              <ul className="mt-4 flex gap-3" aria-label="Product images">
                {gallery.map((src, index) => (
                  <li key={`${src}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                      aria-current={index === imageIndex}
                      className={`h-20 w-20 overflow-hidden rounded-xl border transition ${
                        index === imageIndex
                          ? 'border-violet'
                          : 'border-graphite hover:border-violet/50'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="label-xs">{product.categoryName}</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-mist">{product.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingLine rating={product.rating} reviewCount={product.reviewCount} />
              <span className="text-[11px] uppercase tracking-widest text-mist/70">
                Sample rating data
              </span>
            </div>

            <p className="mt-6 text-2xl font-semibold">{formatPrice(product.priceCents)}</p>
            <p className="mt-1 text-xs text-mist">
              Free shipping on orders over $99 · flat $12 below that.
            </p>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">{product.description}</p>

            {product.colors.length > 0 ? (
              <div className="mt-8">
                <p className="field-label">
                  Finish{selectedColor ? `: ${selectedColor.name}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setColorIndex(index)}
                      aria-label={`Select finish ${color.name}`}
                      aria-pressed={index === colorIndex}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                        index === colorIndex
                          ? 'border-violet text-ink'
                          : 'border-graphite text-mist hover:border-violet/50 hover:text-ink'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: color.hex }}
                        aria-hidden="true"
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-graphite bg-abyss">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => clampQuantity(value - 1, product.stock))}
                  disabled={quantity <= 1}
                  className="px-4 py-3 text-mist transition hover:text-ink disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <label className="sr-only" htmlFor="product-quantity">
                  Quantity
                </label>
                <input
                  id="product-quantity"
                  type="number"
                  value={quantity}
                  min={1}
                  max={maxQuantity}
                  onChange={(event) =>
                    setQuantity(clampQuantity(Number(event.target.value), product.stock))
                  }
                  className="w-12 bg-transparent text-center text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((value) => clampQuantity(value + 1, product.stock))}
                  disabled={quantity >= maxQuantity}
                  className="px-4 py-3 text-mist transition hover:text-ink disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
                disabled={!product.inStock}
                className="btn-primary flex-1 sm:flex-none"
              >
                <ShoppingBag size={16} />
                {product.inStock ? 'Add to cart' : 'Out of stock'}
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                aria-pressed={favorite}
                className={`btn-outline ${
                  favorite ? 'border-violet/60 text-ink' : ''
                }`}
              >
                <Heart size={16} className={favorite ? 'fill-current text-violet' : ''} />
                {favorite ? 'Saved' : 'Save'}
              </button>
            </div>

            <dl className="mt-8 grid gap-4 border-t border-graphite pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Truck size={16} className="mt-0.5 text-violet-soft" />
                <div>
                  <dt className="text-sm text-ink">Free shipping over $99</dt>
                  <dd className="text-xs text-mist">Flat $12 shipping below that.</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw size={16} className="mt-0.5 text-violet-soft" />
                <div>
                  <dt className="text-sm text-ink">30-day returns</dt>
                  <dd className="text-xs text-mist">Unopened items, full refund.</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-0.5 text-violet-soft" />
                <div>
                  <dt className="text-sm text-ink">2-year warranty</dt>
                  <dd className="text-xs text-mist">Demo policy — see warranty page.</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={16} className="mt-0.5 text-violet-soft" />
                <div>
                  <dt className="text-sm text-ink">
                    {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                  </dt>
                  <dd className="text-xs text-mist">Demo inventory levels.</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">Tech-Spec</h2>
            <dl className="mt-6 divide-y divide-graphite border-y border-graphite">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-sm text-mist">{spec.label}</dt>
                  <dd className="text-right text-sm text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Shipping & returns</h2>
            <ul className="mt-6 space-y-3 text-sm text-mist">
              <li className="flex gap-3">
                <Check size={15} className="mt-0.5 shrink-0 text-violet-soft" />
                Orders over $99 ship free; smaller orders ship for a flat $12.
              </li>
              <li className="flex gap-3">
                <Check size={15} className="mt-0.5 shrink-0 text-violet-soft" />
                Dispatched within two business days from the demo warehouse.
              </li>
              <li className="flex gap-3">
                <Check size={15} className="mt-0.5 shrink-0 text-violet-soft" />
                Returns accepted within 30 days on unopened items.
              </li>
              <li className="flex gap-3">
                <Check size={15} className="mt-0.5 shrink-0 text-violet-soft" />
                These policies describe the demo store only.
              </li>
            </ul>
            <Link to="/product-help" className="btn-outline btn-sm mt-6">
              Product help
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">You may also like</h2>
              <Link
                to={`/shop?category=${product.category}`}
                className="inline-flex items-center gap-2 text-sm text-mist transition hover:text-ink"
              >
                More {product.categoryName} <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 60}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
