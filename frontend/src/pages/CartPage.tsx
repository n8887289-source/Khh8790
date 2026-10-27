import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { MAX_QUANTITY_PER_ITEM, formatPrice, FREE_SHIPPING_THRESHOLD_CENTS } from '../lib/format';
import { useStore } from '../store/StoreContext';
import { EmptyState } from '../components/ui';

export default function CartPage() {
  const {
    cart,
    setQuantity,
    removeLine,
    clearCart,
    subtotalCents,
    shippingCents,
    totalCents,
    notify,
  } = useStore();

  if (cart.length === 0) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="Your cart is empty"
          description="Nothing here yet. Explore the catalog and add a pair of headphones, earbuds or a speaker."
          actionLabel="Start shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents, 0);

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Cart
      </nav>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">Your Cart</h1>
        <button
          type="button"
          className="text-xs text-mist underline decoration-graphite underline-offset-4 transition hover:text-ink"
          onClick={() => {
            clearCart();
            notify('Cart emptied.', 'info');
          }}
        >
          Empty cart
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-graphite border-y border-graphite">
          {cart.map((line) => (
            <li key={line.slug} className="flex gap-4 py-5">
              <Link
                to={`/product/${line.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-graphite bg-abyss sm:h-28 sm:w-28"
              >
                <img src={line.image} alt={line.name} className="h-full w-full object-cover" loading="lazy" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/product/${line.slug}`}
                      className="text-sm font-medium text-ink transition hover:text-white sm:text-base"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-mist">{line.subtitle}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(line.priceCents * line.quantity)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center rounded-full border border-graphite bg-abyss">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.slug, line.quantity - 1)}
                      disabled={line.quantity <= 1}
                      className="px-3.5 py-2 text-mist transition hover:text-ink disabled:opacity-40"
                      aria-label={`Decrease quantity of ${line.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="min-w-8 text-center text-sm" aria-live="polite">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.slug, line.quantity + 1)}
                      disabled={line.quantity >= Math.min(MAX_QUANTITY_PER_ITEM, line.stock || 1)}
                      className="px-3.5 py-2 text-mist transition hover:text-ink disabled:opacity-40"
                      aria-label={`Increase quantity of ${line.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeLine(line.slug);
                      notify(`${line.name} removed from your cart.`, 'info');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-mist transition hover:text-ink"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-graphite bg-abyss/60 p-6">
            <h2 className="text-sm font-medium uppercase tracking-widest">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-mist">
                <dt>Subtotal</dt>
                <dd className="text-ink">{formatPrice(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-mist">
                <dt>Shipping</dt>
                <dd className="text-ink">
                  {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-graphite pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(totalCents)}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-mist">
              {remaining > 0
                ? `Add ${formatPrice(remaining)} more for free shipping.`
                : 'This order qualifies for free shipping.'}
            </p>

            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Proceed to checkout
              <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-outline mt-3 w-full">
              <ShoppingBag size={15} /> Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
