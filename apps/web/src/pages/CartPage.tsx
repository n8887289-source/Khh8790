import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { EmptyState } from '../components/ui/Feedback';
import { CartIcon, TrashIcon } from '../lib/icons';
import { FREE_SHIPPING_THRESHOLD } from '../lib/api';
import { formatPrice } from '../lib/format';

export function CartPage() {
  const cart = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-14 sm:py-20">
        <h1 className="text-[30px] sm:text-[40px]">Your Cart</h1>
        <div className="mt-8">
          <EmptyState
            icon={<CartIcon size={30} />}
            title="Your cart is empty"
            description="Nothing here yet. Explore the collection and add something worth hearing."
            actionLabel="Continue shopping"
            actionTo="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 text-[30px] sm:text-[40px]">Your Cart</h1>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <ul className="divide-y divide-[#292b38] border-y border-line">
          {cart.lines.map((line) => (
            <li key={line.slug} className="flex gap-4 py-6">
              <Link to={`/product/${line.slug}`} className="shrink-0">
                <img
                  src={line.image}
                  alt=""
                  className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                  loading="lazy"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold">
                    <Link to={`/product/${line.slug}`} className="link-underline">
                      {line.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-[13px] text-mute tabular-nums">
                    {formatPrice(line.price)} each
                  </p>
                  {!line.inStock ? (
                    <p className="mt-1 text-[12.5px] text-[#ff8b8b]">
                      Out of stock — remove to continue.
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-4">
                    <QuantityStepper
                      size="sm"
                      label={line.name}
                      value={line.quantity}
                      onChange={(quantity) => cart.setQuantity(line.slug, quantity)}
                    />
                    <button
                      type="button"
                      onClick={() => cart.remove(line.slug)}
                      className="inline-flex items-center gap-1.5 text-[12.5px] text-mute transition hover:text-paper"
                    >
                      <TrashIcon size={15} />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-[15px] font-semibold tabular-nums sm:text-right">
                  {formatPrice(line.price * line.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-32 lg:self-start" aria-label="Order summary">
          <div className="surface p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-mute">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Shipping</dt>
                <dd className="tabular-nums">
                  {cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(cart.total)}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[12px] text-mute">
              {remaining > 0
                ? `Add ${formatPrice(remaining)} more to qualify for free shipping (over ${formatPrice(
                    FREE_SHIPPING_THRESHOLD,
                  )}).`
                : 'Free shipping applied.'}
            </p>

            <div className="mt-6 space-y-2">
              <Button to="/checkout" fullWidth size="lg">
                Proceed to Checkout
              </Button>
              <Button to="/shop" variant="outline" fullWidth>
                Continue shopping
              </Button>
            </div>

            <p className="mt-5 text-[11.5px] leading-relaxed text-mute/85">
              Items and prices are stored in your browser so the cart survives a refresh. Checkout
              recalculates every price on the server.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
