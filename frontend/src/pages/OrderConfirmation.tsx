import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Package } from 'lucide-react';
import { api, type Order } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import { EmptyState, Spinner } from '../components/ui';

export default function OrderConfirmation() {
  const { number = '' } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const handedOver = (location.state as { order?: Order } | null)?.order;
  const token = params.get('token') ?? '';

  const [order, setOrder] = useState<Order | null>(
    handedOver && handedOver.number === number ? handedOver : null,
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>(
    handedOver && handedOver.number === number ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (handedOver && handedOver.number === number) {
      setOrder(handedOver);
      setStatus('ready');
      return;
    }
    if (!token) {
      setStatus('missing');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    api
      .order(number, token)
      .then(({ order: found }) => {
        if (cancelled) return;
        setOrder(found);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [number, token, handedOver]);

  if (status === 'loading') {
    return (
      <div className="shell py-16">
        <Spinner label="Loading order" />
      </div>
    );
  }

  if (status === 'missing' || !order) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="That order could not be opened"
          description="Order details need the order number and the lookup token from the confirmation link. Enter both on the track order page."
          actionLabel="Track an order"
          actionTo="/track-order"
        />
      </div>
    );
  }

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Order {order.number}
      </nav>

      <div className="mt-6 flex items-center gap-3">
        <CheckCircle2 size={22} className="text-violet-soft" />
        <h1 className="text-3xl font-semibold sm:text-4xl">Order recorded</h1>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
        Thank you, {order.name}. This demo store has saved your order and shown a confirmation — no
        payment has been taken and no card details were collected.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="chip">
          <Package size={13} /> {order.number}
        </span>
        <span className="chip">{formatDate(order.createdAt)}</span>
        <span className="rounded-full border border-violet/40 bg-violet/15 px-3 py-1 text-xs text-ink">
          {order.status.replace(/-/g, ' ')}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-widest">Items</h2>
          <ul className="mt-5 divide-y divide-graphite border-y border-graphite">
            {order.items.map((item) => (
              <li key={`${item.name}-${item.quantity}`} className="flex items-center gap-4 py-4">
                <img
                  src={item.image}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-graphite object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link
                      to={`/product/${item.slug}`}
                      className="block truncate text-sm font-medium text-ink transition hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                  )}
                  <span className="block text-xs text-mist">
                    {item.subtitle} · Quantity {item.quantity}
                  </span>
                </span>
                <span className="text-sm">{formatPrice(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-outline btn-sm">
              Continue shopping <ArrowRight size={14} />
            </Link>
            <Link to="/track-order" className="btn-ghost btn-sm">
              Track this order
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-graphite bg-abyss/60 p-6">
            <h2 className="text-sm font-medium uppercase tracking-widest">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-mist">
                <dt>Subtotal</dt>
                <dd className="text-ink">{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-mist">
                <dt>Shipping</dt>
                <dd className="text-ink">
                  {order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-graphite pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-mist">
              No payment was processed. Configuring a payment provider (for example Stripe) is what
              would turn this into a real transaction.
            </p>
          </div>

          <div className="rounded-2xl border border-graphite bg-abyss/60 p-6">
            <h2 className="text-sm font-medium uppercase tracking-widest">Shipping to</h2>
            <address className="mt-4 space-y-0.5 text-sm not-italic text-mist">
              <span className="block text-ink">{order.name}</span>
              <span className="block">{order.shipping.address1}</span>
              {order.shipping.address2 ? <span className="block">{order.shipping.address2}</span> : null}
              <span className="block">
                {order.shipping.postalCode} {order.shipping.city}
              </span>
              <span className="block">{order.shipping.country}</span>
              <span className="mt-3 block">{order.email}</span>
            </address>
            {order.notes ? (
              <p className="mt-4 border-t border-graphite pt-4 text-xs leading-relaxed text-mist">
                Delivery notes: {order.notes}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
