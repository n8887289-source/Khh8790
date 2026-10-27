import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, Reveal, Spinner } from '../components/ui';

export default function Favorites() {
  const { favorites, catalog, ready, customer, setAccountOpen } = useStore();
  const items = catalog.filter((product) => favorites.includes(product.slug));

  if (!ready) {
    return (
      <div className="shell py-16">
        <Spinner label="Loading saved items" />
      </div>
    );
  }

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Saved items
      </nav>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Saved Items</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-mist">
            <Heart size={15} className="text-violet" />
            {items.length} product{items.length === 1 ? '' : 's'} saved
          </p>
        </div>
        {!customer ? (
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => setAccountOpen(true)}
          >
            Sign in to keep these with your account
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any product and it will be kept here in this browser."
            actionLabel="Browse products"
            actionTo="/shop"
          />
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((product, index) => (
              <Reveal key={product.slug} delay={Math.min(index * 50, 200)}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-mist/80">
            Saved items live in this browser. Signing in copies them to your account so they follow
            you to another device.{' '}
            <Link to="/account" className="text-ink underline decoration-graphite underline-offset-4">
              Manage account
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
