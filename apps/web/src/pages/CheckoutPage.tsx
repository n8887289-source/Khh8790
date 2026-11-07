import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api, ApiError } from '../lib/api';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { CartIcon, CheckIcon, InfoIcon, SpinnerIcon } from '../lib/icons';
import { formatPrice, isValidEmail } from '../lib/format';
import type { OrderItem, OrderSummary } from '../lib/types';

type Fields = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  notes: string;
};

const EMPTY: Fields = {
  name: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  country: '',
  notes: '',
};

const LABELS: Record<keyof Fields, string> = {
  name: 'Full name',
  email: 'Email address',
  phone: 'Phone (optional)',
  addressLine1: 'Street address',
  addressLine2: 'Apartment, suite (optional)',
  city: 'City',
  postcode: 'Postcode',
  country: 'Country',
  notes: 'Delivery notes (optional)',
};

const REQUIRED: (keyof Fields)[] = [
  'name',
  'email',
  'addressLine1',
  'city',
  'postcode',
  'country',
];

export function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [globalError, setGlobalError] = useState('');
  const [busy, setBusy] = useState(false);

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-14 sm:py-20">
        <h1 className="text-[30px] sm:text-[40px]">Checkout</h1>
        <div className="mt-8">
          <EmptyState
            icon={<CartIcon size={30} />}
            title="There is nothing to check out"
            description="Add a product to your cart first and the checkout will open with it."
            actionLabel="Continue shopping"
            actionTo="/shop"
          />
        </div>
      </div>
    );
  }

  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (fields.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!isValidEmail(fields.email)) next.email = 'Please enter a valid email address.';
    if (fields.addressLine1.trim().length < 4) next.addressLine1 = 'Please enter your street address.';
    if (fields.city.trim().length < 2) next.city = 'Please enter your city.';
    if (fields.postcode.trim().length < 2) next.postcode = 'Please enter your postcode.';
    if (fields.country.trim().length < 2) next.country = 'Please enter your country.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setGlobalError('');
    if (!validate()) {
      setGlobalError('Please check the highlighted fields.');
      return;
    }

    setBusy(true);
    try {
      const result = await api.createOrder({
        customer: fields,
        items: cart.lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
      });
      const order: OrderSummary = result.order;
      const items: OrderItem[] = result.items;
      cart.clear();
      navigate(`/order/${order.orderNumber}`, { state: { order, items }, replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(error.fields as Partial<Record<keyof Fields, string>>);
      }
      setGlobalError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const update = (key: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 text-[30px] sm:text-[40px]">Delivery details</h1>
        <p className="mt-3 max-w-2xl text-[14px] text-mute">
          We only ask for what a normal order needs. Card details are never requested or stored.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="surface flex gap-3 p-4">
            <InfoIcon size={18} className="mt-0.5 shrink-0 text-brand-soft" />
            <p className="text-[12.5px] leading-relaxed text-mute">
              <strong className="font-semibold text-paper">Demo checkout.</strong> No payment
              provider is configured for this store, so placing the order records it as unpaid and
              nothing is charged. Adding a provider is a separate configuration step.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {(['name', 'email', 'phone', 'country', 'addressLine1', 'addressLine2', 'city', 'postcode'] as const).map(
              (key) => (
                <div key={key} className={key === 'addressLine1' || key === 'addressLine2' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={key} className="eyebrow">
                    {LABELS[key]}
                    {REQUIRED.includes(key) ? <span className="ml-1 text-brand-soft">*</span> : null}
                  </label>
                  <input
                    id={key}
                    name={key}
                    type={key === 'email' ? 'email' : 'text'}
                    value={fields[key]}
                    onChange={update(key)}
                    className={`field mt-2 ${errors[key] ? 'field-error' : ''}`}
                    aria-invalid={Boolean(errors[key])}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                    autoComplete={
                      key === 'name'
                        ? 'name'
                        : key === 'email'
                          ? 'email'
                          : key === 'phone'
                            ? 'tel'
                            : key === 'country'
                              ? 'country-name'
                              : key === 'addressLine1'
                                ? 'address-line1'
                                : key === 'addressLine2'
                                  ? 'address-line2'
                                  : key === 'city'
                                    ? 'address-level2'
                                    : 'postal-code'
                    }
                  />
                  {errors[key] ? (
                    <p id={`${key}-error`} role="alert" className="mt-1.5 text-[12px] text-[#ff8b8b]">
                      {errors[key]}
                    </p>
                  ) : null}
                </div>
              ),
            )}
          </div>

          <div>
            <label htmlFor="notes" className="eyebrow">
              {LABELS.notes}
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={fields.notes}
              onChange={update('notes')}
              className="field mt-2 resize-y"
            />
          </div>

          {globalError ? (
            <p role="alert" className="rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[13px] text-[#ffb3b3]">
              {globalError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? (
                <>
                  <SpinnerIcon size={16} /> Placing order…
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Place demo order
                </>
              )}
            </Button>
            <Button to="/cart" variant="outline">
              Back to cart
            </Button>
          </div>
        </form>

        <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
          <div className="surface p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {cart.lines.map((line) => (
                <li key={line.slug} className="flex items-center gap-3">
                  <img src={line.image} alt="" className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{line.name}</span>
                    <span className="block text-[12px] text-mute">Qty {line.quantity}</span>
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-mute">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
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

            <p className="mt-5 text-[11.5px] leading-relaxed text-mute/85">
              Totals are recalculated on the server from the catalogue, so the amount recorded on
              your order cannot be altered by the browser. Shipping is free over{' '}
              {formatPrice(99)}.{' '}
              <Link to="/support/returns" className="link-underline">
                Returns policy
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
