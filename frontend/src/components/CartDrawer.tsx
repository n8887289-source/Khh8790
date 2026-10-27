import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice, FREE_SHIPPING_THRESHOLD_CENTS, MAX_QUANTITY_PER_ITEM } from '../lib/format';
import { useBodyLock, useEscapeKey } from '../lib/hooks';
import { useStore } from '../store/StoreContext';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    setQuantity,
    removeLine,
    subtotalCents,
    shippingCents,
    totalCents,
    cartCount,
  } = useStore();

  useBodyLock(cartOpen);
  useEscapeKey(cartOpen, () => setCartOpen(false));

  if (!cartOpen) return null;

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents, 0);
  const progress = Math.min((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100, 100);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[26rem] animate-scale-in flex-col border-l border-graphite bg-midnight">
        <header className="flex h-16 items-center justify-between border-b border-graphite px-5">
          <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
            Your cart
            <span className="text-mist">({cartCount})</span>
          </h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-graphite bg-abyss">
              <ShoppingBag size={22} className="text-mist" />
            </span>
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm text-mist">
              Add a pair of headphones, earbuds or a speaker and it will appear here.
            </p>
            <button type="button" className="btn-primary btn-sm" onClick={() => setCartOpen(false)}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-graphite px-5 py-3">
              {remaining > 0 ? (
                <p className="text-xs text-mist">
                  You are <span className="text-ink">{formatPrice(remaining)}</span> away from free
                  shipping.
                </p>
              ) : (
                <p className="text-xs text-sonic-soft">This order ships free.</p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sonic to-violet transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-graphite overflow-y-auto px-5">
              {cart.map((line) => (
                <li key={line.slug} className="flex gap-3 py-4">
                  <Link
                    to={`/product/${line.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-graphite bg-abyss"
                  >
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/product/${line.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="text-sm font-medium leading-snug text-ink hover:text-white"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLine(line.slug)}
                        className="text-mist transition hover:text-ink"
                        aria-label={`Remove ${line.name} from cart`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-mist">{line.subtitle}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-graphite">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-mist transition hover:text-ink disabled:opacity-40"
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          aria-label={`Decrease quantity of ${line.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-7 text-center text-xs" aria-live="polite">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-mist transition hover:text-ink disabled:opacity-40"
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          disabled={
                            line.quantity >= Math.min(MAX_QUANTITY_PER_ITEM, line.stock || 1)
                          }
                          aria-label={`Increase quantity of ${line.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(line.priceCents * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-graphite px-5 py-5">
              <dl className="space-y-1.5 text-sm">
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
                <div className="flex justify-between border-t border-graphite pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(totalCents)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-primary w-full"
              >
                Checkout
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center justify-between text-xs">
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="text-mist transition hover:text-ink"
                >
                  View full cart
                </Link>
                <button
                  type="button"
                  className="text-mist transition hover:text-ink"
                  onClick={() => setCartOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
