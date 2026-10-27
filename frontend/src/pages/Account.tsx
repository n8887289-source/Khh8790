import { Link } from 'react-router-dom';
import { Heart, LogOut, Package, ShieldCheck, User } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { EmptyState } from '../components/ui';

export default function Account() {
  const { customer, favorites, setAccountOpen, signOut } = useStore();

  if (!customer) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="You are browsing as a guest"
          description="The cart and saved items already work without an account. Signing in stores your saved items with your email address."
        >
          <button type="button" className="btn-primary btn-sm mt-2" onClick={() => setAccountOpen(true)}>
            <User size={15} /> Sign in or create an account
          </button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="shell py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="label-xs">
        Home / Account
      </nav>

      <header className="mt-6">
        <p className="label-xs">Signed in</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
          {customer.name || 'SONIQUE listener'}
        </h1>
        <p className="mt-2 text-sm text-mist">{customer.email}</p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/favorites"
          className="rounded-2xl border border-graphite bg-abyss/60 p-6 transition hover:border-violet/50"
        >
          <Heart size={18} className="text-violet-soft" />
          <h2 className="mt-4 text-base font-medium">Saved items</h2>
          <p className="mt-1 text-sm text-mist">
            {favorites.length} saved product{favorites.length === 1 ? '' : 's'}
          </p>
        </Link>

        <Link
          to="/track-order"
          className="rounded-2xl border border-graphite bg-abyss/60 p-6 transition hover:border-violet/50"
        >
          <Package size={18} className="text-violet-soft" />
          <h2 className="mt-4 text-base font-medium">Track an order</h2>
          <p className="mt-1 text-sm text-mist">Use your order number and lookup token.</p>
        </Link>

        <div className="rounded-2xl border border-graphite bg-abyss/60 p-6">
          <ShieldCheck size={18} className="text-violet-soft" />
          <h2 className="mt-4 text-base font-medium">Security</h2>
          <p className="mt-1 text-sm text-mist">
            Passwords are stored as salted scrypt hashes. Sessions use an HttpOnly cookie signed with
            the server’s session secret.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="btn-outline btn-sm mt-10"
      >
        <LogOut size={15} /> Sign out
      </button>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-mist/70">
        This demonstration store keeps account records — email, display name and a password hash —
        in its own database. Order history is not listed here; use the lookup token from your order
        confirmation.
      </p>
    </div>
  );
}
