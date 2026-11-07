import { api } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { useFavorites } from '../context/FavoritesContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/Feedback';
import { Reveal } from '../components/ui/Reveal';
import { HeartIcon } from '../lib/icons';

export function FavoritesPage() {
  const favorites = useFavorites();
  const { data, loading, error, retry } = useAsync('favourites', () => api.products({}));

  const saved = (data?.products ?? []).filter((product) => favorites.slugs.includes(product.slug));

  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Your list</p>
        <h1 className="mt-3 text-[30px] sm:text-[40px]">Favourites</h1>
        <p className="mt-3 max-w-2xl text-[14px] text-mute">
          Saved on this device, so they are still here after a refresh. Sign-in is not configured for
          this store, so favourites are not synced between browsers.
        </p>
      </header>

      <div className="mt-8">
        {favorites.slugs.length === 0 ? (
          <EmptyState
            icon={<HeartIcon size={28} />}
            title="No favourites yet"
            description="Tap the heart on any product and it will be waiting for you here."
            actionLabel="Browse products"
            actionTo="/shop"
          />
        ) : error ? (
          <ErrorState description="We could not load your saved products." onRetry={retry} />
        ) : loading ? (
          <LoadingGrid count={4} />
        ) : saved.length === 0 ? (
          <EmptyState
            title="Saved products are no longer listed"
            description="The products you saved are not in the catalogue any more. Browse the collection for the current range."
            actionLabel="Browse products"
            actionTo="/shop"
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {saved.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 40}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
