import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QuantityStepper } from '../ui/QuantityStepper';
import { CartIcon, TrashIcon } from '../../lib/icons';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { FREE_SHIPPING_THRESHOLD } from '../../lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const cart = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);

  return (
    <Modal
      open={open}
      onClose={onClose}
      placement="right"
      title={`Your cart (${cart.count})`}
      labelledBy="cart-drawer-title"
    >
      {cart.lines.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CartIcon size={28} className="mb-4 text-brand-soft" />
          <h3 className="text-base font-semibold">Your cart is empty</h3>
          <p className="mt-2 text-sm text-mute">
            Browse the collection and add something worth hearing.
          </p>
          <Button to="/shop" className="mt-5" onClick={onClose}>
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="space-y-4">
            {cart.lines.map((line) => (
              <li key={line.slug} className="flex gap-3">
                <Link to={`/product/${line.slug}`} onClick={onClose} className="shrink-0">
                  <img
                    src={line.image}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                    loading="lazy"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${line.slug}`}
                      onClick={onClose}
                      className="text-[13.5px] font-medium link-underline"
                    >
                      {line.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.slug)}
                      className="text-mute transition hover:text-paper"
                      aria-label={`Remove ${line.name} from cart`}
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-mute tabular-nums">
                    {formatPrice(line.price)} each
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      label={line.name}
                      value={line.quantity}
                      onChange={(quantity) => cart.setQuantity(line.slug, quantity)}
                    />
                    <span className="text-[13.5px] font-semibold tabular-nums">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            <dl className="space-y-2 text-[13.5px]">
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
              <div className="flex justify-between border-t border-line pt-2 text-[15px]">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(cart.total)}</dd>
              </div>
            </dl>

            {remaining > 0 ? (
              <p className="mt-3 text-[12px] text-mute">
                Add {formatPrice(remaining)} more for free shipping.
              </p>
            ) : (
              <p className="mt-3 text-[12px] text-brand-soft">Free shipping applied.</p>
            )}

            <div className="mt-5 space-y-2">
              <Button to="/checkout" fullWidth onClick={onClose}>
                Checkout
              </Button>
              <Button to="/cart" variant="outline" fullWidth onClick={onClose}>
                View full cart
              </Button>
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-mute">
              Shipping is free on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}. No payment
              provider is configured for this store, so checkout places a demo order.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
