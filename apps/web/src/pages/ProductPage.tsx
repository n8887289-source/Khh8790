import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { ProductCard } from '../components/ProductCard';
import { ErrorState, InlineLoading } from '../components/ui/Feedback';
import { Reveal } from '../components/ui/Reveal';
import { CartIcon, CheckIcon, HeartIcon, TruckIcon, WaveIcon, CraftIcon } from '../lib/icons';
import { cn } from '../lib/cn';
import { clampQuantity, formatPrice } from '../lib/format';

const SHIPPING_INFO = [
  {
    icon: TruckIcon,
    title: 'Free shipping over $99',
    copy: 'Orders below $99 ship for a flat $9.95. Dispatched within one business day.',
  },
  {
    icon: CraftIcon,
    title: '2 year warranty',
    copy: 'Every SONIQUE product is covered against manufacturing defects for two years.',
  },
  {
    icon: WaveIcon,
    title: '30 day returns',
    copy: 'Not the sound you were after? Return it within 30 days for a full refund.',
  },
];

export function ProductPage() {
  const { slug = '' } = useParams();
  const cart = useCart();
  const favorites = useFavorites();
  const { notify } = useToast();

  const { data, loading, error, retry } = useAsync(slug, () => api.product(slug));

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState('');

  const product = data?.product;

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setQuantityError('');
    setColor(data?.product.colors[0] ?? '');
  }, [data]);

  if (loading) {
    return (
      <div className="shell py-16">
        <InlineLoading label="Loading product" />
      </div>
    );
  }

  if (error || !product) {
    const missing = (error ?? '').toLowerCase().includes('not found');
    return (
      <div className="shell py-16">
        <ErrorState
          title={missing ? 'We could not find that product' : 'Something went wrong'}
          description={
            missing
              ? 'The link may be out of date. Browse the collection to find what you are looking for.'
              : (error ?? 'The product could not be loaded. Please try again.')
          }
          onRetry={missing ? undefined : retry}
        />
        <div className="mt-6 text-center">
          <Button to="/shop" variant="outline">
            Browse all products
          </Button>
        </div>
      </div>
    );
  }

  const saved = favorites.has(product.slug);
  const inCart = cart.quantityOf(product.slug);
  const images = product.images.length ? product.images : [''];

  const addToCart = () => {
    if (!product.inStock) return;
    cart.add(product, quantity);
    notify({
      tone: 'success',
      title: `${quantity} × ${product.name} added to cart`,
      description: `Your cart total is now ${formatPrice(
        cart.subtotal + product.price * quantity,
      )}.`,
    });
  };

  const toggleFavorite = () => {
    const nowSaved = favorites.toggle(product.slug);
    notify({
      tone: 'success',
      title: nowSaved ? 'Saved to favourites' : 'Removed from favourites',
      description: product.name,
    });
  };

  return (
    <div className="shell py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-[12px] text-mute">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="transition hover:text-paper">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/shop" className="transition hover:text-paper">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/shop?category=${product.categorySlug}`} className="transition hover:text-paper">
              {product.categoryName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-paper">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-navy">
            <img
              key={images[activeImage]}
              src={images[activeImage]}
              alt={`${product.name} — ${product.tagline}`}
              className="animate-fade aspect-square w-full object-cover"
              width="900"
              height="900"
            />
            {product.badge ? (
              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
                {product.badge}
              </span>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1} of ${product.name}`}
                  aria-pressed={index === activeImage}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-xl border transition sm:h-24 sm:w-24',
                    index === activeImage
                      ? 'border-brand'
                      : 'border-line opacity-70 hover:opacity-100',
                  )}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow">{product.categoryName}</p>
          <h1 className="mt-3 text-[30px] sm:text-[40px]">{product.name}</h1>
          <p className="mt-2 text-[15px] text-mute">{product.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StarRating rating={product.rating} size={16} />
            <span className="text-[13.5px] font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-[12.5px] text-mute">
              {product.reviewCount} sample reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-base text-mute line-through tabular-nums">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-mute">
            {product.description}
          </p>

          {product.colors.length > 0 ? (
            <div className="mt-8">
              <p className="eyebrow">
                Colour — <span className="text-paper">{color}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    aria-pressed={color === option}
                    className={cn(
                      'rounded-full border px-4 py-2 text-[12.5px] transition',
                      color === option
                        ? 'border-brand bg-brand/15 text-paper'
                        : 'border-line text-mute hover:border-white/25 hover:text-paper',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <QuantityStepper
              label={product.name}
              value={quantity}
              onChange={(value) => {
                const parsed = Number(value);
                if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
                  setQuantityError('Choose a quantity between 1 and 10.');
                  setQuantity(clampQuantity(Number.isFinite(parsed) ? parsed : 1));
                  return;
                }
                setQuantityError('');
                setQuantity(parsed);
              }}
            />
            <span className="text-[12.5px] text-mute">
              {product.inStock ? 'In stock — ships in 1 business day' : 'Currently out of stock'}
            </span>
          </div>
          {quantityError ? (
            <p role="alert" className="mt-2 text-[12.5px] text-[#ff8b8b]">
              {quantityError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={addToCart} disabled={!product.inStock}>
              <CartIcon size={16} />
              {product.inStock ? 'Add to Cart' : 'Out of stock'}
            </Button>
            <Button variant="outline" size="lg" onClick={toggleFavorite}>
              <HeartIcon size={16} filled={saved} />
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>

          {inCart > 0 ? (
            <p className="mt-4 flex items-center gap-2 text-[12.5px] text-brand-soft">
              <CheckIcon size={14} /> {inCart} in your cart ·{' '}
              <Link to="/cart" className="link-underline">
                View cart
              </Link>
            </p>
          ) : null}

          <div className="mt-8 border-t border-line pt-6">
            <p className="eyebrow">Shipping &amp; returns</p>
            <ul className="mt-4 space-y-4">
              {SHIPPING_INFO.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon size={18} className="mt-0.5 shrink-0 text-brand-soft" />
                  <span>
                    <span className="block text-[13.5px] font-medium">{item.title}</span>
                    <span className="block text-[12.5px] text-mute">{item.copy}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specs.length > 0 ? (
        <section className="mt-16" aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-xl font-semibold sm:text-2xl">
            Specifications
          </h2>
          <dl className="surface mt-5 divide-y divide-[#292b38]">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                <dt className="text-[12.5px] uppercase tracking-[0.14em] text-mute">{spec.label}</dt>
                <dd className="text-[13.5px]">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Related */}
      {data && data.related.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-semibold sm:text-2xl">
            You may also like
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {data.related.map((item, index) => (
              <Reveal as="li" key={item.slug} delay={index * 50}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
