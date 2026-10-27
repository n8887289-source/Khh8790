import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useStore } from '../store/StoreContext';
import { EmptyState } from '../components/ui';

const COUNTRIES = ['France', 'Germany', 'United States', 'United Kingdom', 'Netherlands', 'Canada'];

export default function Checkout() {
  const { cart, subtotalCents, shippingCents, totalCents, clearCart, notify, customer } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'France',
    notes: '',
  });

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  if (cart.length === 0) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty. Add a product and it will appear here ready for checkout."
          actionLabel="Browse products"
          actionTo="/shop"
        />
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const items = cart.map((line) => ({ slug: line.slug, quantity: line.quantity }));
    try {
      const { order } = await api.createOrder({ ...form, items });
      clearCart();
      notify(`Order ${order.number} recorded.`, 'success');
      navigate(`/order/${order.number}?token=${order.lookupToken ?? ''}`, { state: { order } });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'The order could not be recorded.';
      setError(message);
      notify(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Cart / Checkout
      </nav>
      <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Checkout</h1>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet/40 bg-violet/10 px-5 py-4">
        <Lock size={16} className="mt-0.5 shrink-0 text-violet-soft" />
        <p className="text-sm leading-relaxed text-ink/90">
          <span className="font-medium">Demo checkout — no payment is processed.</span> No card
          details are requested or stored. Real payment collection needs a configured provider (for
          example Stripe) and is not part of this demo store.
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <fieldset className="rounded-2xl border border-graphite bg-abyss/50 p-6">
            <legend className="label-xs px-2">Contact</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="checkout-name">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  required
                  className="field"
                  value={form.name}
                  onChange={(event) => update({ name: event.target.value })}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="checkout-email">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  className="field"
                  value={form.email}
                  onChange={(event) => update({ email: event.target.value })}
                  autoComplete="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="checkout-phone">
                  Phone (optional)
                </label>
                <input
                  id="checkout-phone"
                  className="field"
                  value={form.phone}
                  onChange={(event) => update({ phone: event.target.value })}
                  autoComplete="tel"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-graphite bg-abyss/50 p-6">
            <legend className="label-xs px-2">Shipping address</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="checkout-address1">
                  Street address
                </label>
                <input
                  id="checkout-address1"
                  required
                  className="field"
                  value={form.address1}
                  onChange={(event) => update({ address1: event.target.value })}
                  autoComplete="address-line1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="checkout-address2">
                  Apartment, floor (optional)
                </label>
                <input
                  id="checkout-address2"
                  className="field"
                  value={form.address2}
                  onChange={(event) => update({ address2: event.target.value })}
                  autoComplete="address-line2"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="checkout-city">
                  City
                </label>
                <input
                  id="checkout-city"
                  required
                  className="field"
                  value={form.city}
                  onChange={(event) => update({ city: event.target.value })}
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="checkout-postal">
                  Postal code
                </label>
                <input
                  id="checkout-postal"
                  required
                  className="field"
                  value={form.postalCode}
                  onChange={(event) => update({ postalCode: event.target.value })}
                  autoComplete="postal-code"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="checkout-country">
                  Country
                </label>
                <select
                  id="checkout-country"
                  className="field"
                  value={form.country}
                  onChange={(event) => update({ country: event.target.value })}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="checkout-notes">
                  Delivery notes (optional)
                </label>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  className="field resize-none"
                  value={form.notes}
                  onChange={(event) => update({ notes: event.target.value })}
                />
              </div>
            </div>
          </fieldset>

          {error ? (
            <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-graphite bg-abyss/60 p-6">
            <h2 className="text-sm font-medium uppercase tracking-widest">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {cart.map((line) => (
                <li key={line.slug} className="flex items-center gap-3">
                  <img
                    src={line.image}
                    alt=""
                    className="h-14 w-14 rounded-lg border border-graphite object-cover"
                    loading="lazy"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{line.name}</span>
                    <span className="block text-xs text-mist">Quantity {line.quantity}</span>
                  </span>
                  <span className="text-sm">{formatPrice(line.priceCents * line.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-graphite pt-5 text-sm">
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

            <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
              {busy ? 'Recording order…' : 'Place demo order'}
              {busy ? null : <ArrowRight size={16} />}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-mist">
              This records an order in the store database and shows a confirmation. No payment is
              taken and no card data is stored.
            </p>
            <Link to="/cart" className="mt-4 inline-block text-xs text-mist transition hover:text-ink">
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
