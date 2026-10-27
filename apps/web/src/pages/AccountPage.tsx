import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { Button } from '../components/ui/Button';
import { InfoIcon } from '../lib/icons';
import { formatPrice, isValidEmail } from '../lib/format';

export function AccountPage() {
  const cart = useCart();
  const favorites = useFavorites();
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!orderNumber.trim()) {
      setError('Enter the order number from your confirmation.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter the email address used for the order.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await api.order(orderNumber.trim(), email.trim());
      navigate(`/order/${result.order.orderNumber}`, { state: result });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not find that order.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-[30px] sm:text-[40px]">Your account</h1>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="surface p-6" aria-labelledby="orders-title">
          <h2 id="orders-title" className="text-lg font-semibold">
            Find an order
          </h2>
          <p className="mt-2 text-[13px] text-mute">
            Enter the order number from your confirmation email along with the email address you used.
            Both must match before an order is shown.
          </p>

          <form onSubmit={lookup} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="account-order" className="eyebrow">
                Order number
              </label>
              <input
                id="account-order"
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                placeholder="SQ-XXXXXXXXX"
                className="field mt-2 font-mono"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="account-email" className="eyebrow">
                Email address
              </label>
              <input
                id="account-email"
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
            <Button type="submit" disabled={busy}>
              {busy ? 'Checking…' : 'View order'}
            </Button>
          </form>
        </section>

        <section className="space-y-4" aria-labelledby="device-title">
          <h2 id="device-title" className="text-lg font-semibold">
            On this device
          </h2>

          <div className="surface flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-[13.5px] font-medium">Cart</p>
              <p className="mt-0.5 text-[12.5px] text-mute">
                {cart.count} item{cart.count === 1 ? '' : 's'} · {formatPrice(cart.subtotal)}
              </p>
            </div>
            <Button to="/cart" variant="outline" size="sm">
              Open cart
            </Button>
          </div>

          <div className="surface flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-[13.5px] font-medium">Favourites</p>
              <p className="mt-0.5 text-[12.5px] text-mute">
                {favorites.count} saved product{favorites.count === 1 ? '' : 's'}
              </p>
            </div>
            <Button to="/favorites" variant="outline" size="sm">
              View list
            </Button>
          </div>

          <div className="surface flex gap-3 p-5">
            <InfoIcon size={18} className="mt-0.5 shrink-0 text-brand-soft" />
            <p className="text-[12.5px] leading-relaxed text-mute">
              <strong className="font-semibold text-paper">Sign-in is not configured.</strong> This
              storefront has no authentication service connected, so there are no passwords or
              profiles yet. Orders can still be looked up above, and the cart and favourites are kept
              in this browser. Browsing, adding to the cart and saving favourites never require an
              account.
            </p>
          </div>

          <p className="text-[12.5px] text-mute">
            Need help with an order?{' '}
            <Link to="/support/contact" className="link-underline text-paper">
              Contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
