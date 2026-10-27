import { useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { InfoIcon } from '../lib/icons';
import { formatDate, formatPrice, isValidEmail } from '../lib/format';
import type { OrderItem, OrderSummary } from '../lib/types';

type State = { order?: OrderSummary; items?: OrderItem[] };

export function OrderPage() {
  const { orderNumber = '' } = useParams();
  const location = useLocation();
  const initial = (location.state ?? {}) as State;

  const [order, setOrder] = useState<OrderSummary | null>(initial.order ?? null);
  const [items, setItems] = useState<OrderItem[]>(initial.items ?? []);
  const [email, setEmail] = useState(initial.order?.email ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The confirmation arrives from the checkout. If the page is reloaded the
  // order is re-fetched, which needs the email address it was placed with.
  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter the email address used for this order.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await api.order(orderNumber, email);
      setOrder(result.order);
      setItems(result.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not find that order.');
    } finally {
      setBusy(false);
    }
  };

  if (!order) {
    return (
      <div className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-lg">
          <h1 className="text-[28px] sm:text-[36px]">Order {orderNumber}</h1>
          <p className="mt-4 text-[14px] text-mute">
            For privacy, an order can only be opened with the email address it was placed with.
          </p>
          <form onSubmit={lookup} className="surface mt-6 space-y-4 p-6">
            <div>
              <label htmlFor="order-email" className="eyebrow">
                Email address
              </label>
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field mt-2"
                autoComplete="email"
              />
            </div>
            {error ? (
              <p role="alert" className="text-[12.5px] text-[#ff8b8b]">
                {error}
              </p>
            ) : null}
            <Button type="submit" fullWidth disabled={busy}>
              {busy ? 'Checking…' : 'View order'}
            </Button>
          </form>
          <div className="mt-6">
            <Button to="/shop" variant="outline">
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Order confirmed</p>
        <h1 className="mt-3 text-[30px] sm:text-[40px]">Thank you, {order.name.split(' ')[0]}</h1>
        <p className="mt-4 text-[14.5px] text-mute">
          Order <span className="font-semibold text-paper">{order.orderNumber}</span> was recorded on{' '}
          {formatDate(order.placedAt)}. A copy of the details below is all this store stores — no card
          information was ever collected.
        </p>

        <div className="surface mt-6 flex gap-3 p-4">
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-brand-soft" />
          <p className="text-[12.5px] leading-relaxed text-mute">
            <strong className="font-semibold text-paper">No payment was taken.</strong> This store has
            no payment provider configured, so the order is held as unpaid demo data. Nothing has been
            charged and no shipment has been arranged.
          </p>
        </div>

        <ul className="surface mt-6 divide-y divide-[#292b38]">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="min-w-0">
                <Link to={`/product/${item.slug}`} className="link-underline text-[13.5px] font-medium">
                  {item.name}
                </Link>
                <span className="mt-0.5 block text-[12px] text-mute">
                  Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                </span>
              </span>
              <span className="text-[13.5px] font-semibold tabular-nums">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="surface mt-4 space-y-3 p-5 text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mute">Shipping</dt>
            <dd className="tabular-nums">
              {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/shop">Continue shopping</Button>
          <Button to="/account" variant="outline">
            Find my orders
          </Button>
        </div>
      </div>
    </div>
  );
}
