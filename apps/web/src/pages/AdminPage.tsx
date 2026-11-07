import { useEffect, useState } from 'react';
import { adminApi, type AdminSession } from '../lib/adminApi';
import { useCategories } from '../hooks/useCategories';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminAudience } from '../components/admin/AdminAudience';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'audience', label: 'Audience' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** Protected area: every request behind it is authorised on the server. */
export function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [tab, setTab] = useState<TabId>('products');
  const { categories } = useCategories();

  useEffect(() => {
    adminApi
      .session()
      .then(setSession)
      .catch(() =>
        setSession({ configured: true, hasAccount: true, authenticated: false, email: null }),
      );
  }, []);

  if (!session) {
    return (
      <div className="shell py-16">
        <p className="text-[13px] text-mute">Checking your session…</p>
      </div>
    );
  }

  if (!session.authenticated) {
    return <AdminLogin session={session} onSignedIn={setSession} />;
  }

  const signOut = async () => {
    await adminApi.logout().catch(() => undefined);
    setSession({ ...session, authenticated: false, email: null });
  };

  return (
    <div className="shell py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Store management</p>
          <h1 className="mt-3 text-[28px] sm:text-[34px]">Dashboard</h1>
          <p className="mt-2 text-[12.5px] text-mute">Signed in as {session.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button to="/" variant="outline" size="sm">
            View storefront
          </Button>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <div role="tablist" aria-label="Management sections" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-[12.5px] transition',
              tab === item.id
                ? 'border-brand bg-brand/15 text-paper'
                : 'border-line text-mute hover:border-white/30 hover:text-paper',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'products' ? <AdminProducts categories={categories} /> : null}
        {tab === 'orders' ? <AdminOrders /> : null}
        {tab === 'audience' ? <AdminAudience /> : null}
      </div>
    </div>
  );
}
