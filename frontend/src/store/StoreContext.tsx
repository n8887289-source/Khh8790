import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, type CartLine, type Customer, type Product } from '../lib/api';
import { MAX_QUANTITY_PER_ITEM, clampQuantity, shippingForSubtotal } from '../lib/format';

const CART_KEY = 'sonique.cart.v1';
const FAVORITES_KEY = 'sonique.favorites.v1';

export type ToastTone = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; tone: ToastTone };

type StoreValue = {
  ready: boolean;
  catalog: Product[];
  cart: CartLine[];
  cartCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clearCart: () => void;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (product: Product) => void;
  customer: Customer | null;
  refreshCustomer: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  registerAccount: (payload: {
    email: string;
    name: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  toasts: Toast[];
  notify: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line) =>
          line &&
          typeof line.slug === 'string' &&
          typeof line.priceCents === 'number' &&
          Number.isFinite(Number(line.quantity)),
      )
      .map((line) => ({
        slug: line.slug,
        name: String(line.name ?? line.slug),
        subtitle: String(line.subtitle ?? ''),
        image: String(line.image ?? ''),
        priceCents: Number(line.priceCents),
        quantity: clampQuantity(Number(line.quantity), Number(line.stock ?? MAX_QUANTITY_PER_ITEM)),
        stock: Number(line.stock ?? MAX_QUANTITY_PER_ITEM),
      }));
  } catch {
    return [];
  }
}

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((slug) => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const toastId = useRef(0);
  const customerRef = useRef<Customer | null>(null);
  customerRef.current = customer;

  // Restore the guest basket and saved items before the first paint that depends on them.
  useEffect(() => {
    setCart(readCart());
    setFavorites(readFavorites());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, ready]);

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const refreshCustomer = useCallback(async () => {
    try {
      const { customer: me } = await api.me();
      setCustomer(me);
    } catch {
      setCustomer(null);
    }
  }, []);

  // Sign-in state + catalog snapshot (also powers instant search and the favourites page).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { products } = await api.products({ limit: 120 });
        if (!cancelled) setCatalog(products);
      } catch {
        if (!cancelled) setCatalog([]);
      }
      try {
        const { customer: me } = await api.me();
        if (cancelled) return;
        setCustomer(me);
        if (me) {
          const local = readFavorites();
          const { slugs } = await api.syncFavorites(local);
          if (!cancelled) {
            setFavorites((current) => Array.from(new Set([...slugs, ...current])));
          }
        }
      } catch {
        /* guest browsing: no account needed */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      const requested = clampQuantity(quantity, product.stock);
      if (!product.inStock) {
        notify(`${product.name} is currently out of stock.`, 'error');
        return;
      }
      setCart((current) => {
        const existing = current.find((line) => line.slug === product.slug);
        if (existing) {
          const next = clampQuantity(existing.quantity + requested, product.stock);
          if (next === existing.quantity) {
            notify(`You already have the maximum ${MAX_QUANTITY_PER_ITEM} of ${product.name}.`, 'info');
            return current;
          }
          return current.map((line) =>
            line.slug === product.slug ? { ...line, quantity: next } : line,
          );
        }
        return [
          ...current,
          {
            slug: product.slug,
            name: product.name,
            subtitle: product.subtitle,
            image: product.image,
            priceCents: product.priceCents,
            quantity: requested,
            stock: product.stock,
          },
        ];
      });
      notify(`${product.name} added to your cart.`, 'success');
    },
    [notify],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      setCart((current) =>
        current.map((line) =>
          line.slug === slug
            ? { ...line, quantity: clampQuantity(quantity, line.stock) }
            : line,
        ),
      );
    },
    [],
  );

  const removeLine = useCallback((slug: string) => {
    setCart((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (product: Product) => {
      const wasFavorite = favorites.includes(product.slug);
      setFavorites((current) =>
        wasFavorite ? current.filter((slug) => slug !== product.slug) : [...current, product.slug],
      );
      notify(
        wasFavorite ? `${product.name} removed from saved items.` : `${product.name} saved.`,
        wasFavorite ? 'info' : 'success',
      );
      // Signed-in shoppers additionally keep their saved items on the server.
      if (customerRef.current) {
        const call = wasFavorite ? api.removeFavorite(product.slug) : api.addFavorite(product.slug);
        call.catch(() => {
          /* local list stays authoritative for the browser session */
        });
      }
    },
    [favorites, notify],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { customer: me } = await api.login(email, password);
      setCustomer(me);
      const local = readFavorites();
      const { slugs } = await api.syncFavorites(local);
      setFavorites(Array.from(new Set([...slugs, ...local])));
      notify(`Welcome back, ${me.name || me.email}.`, 'success');
    },
    [notify],
  );

  const registerAccount = useCallback(
    async (payload: { email: string; name: string; password: string }) => {
      const { customer: me } = await api.register(payload);
      setCustomer(me);
      const { slugs } = await api.syncFavorites(readFavorites());
      setFavorites((current) => Array.from(new Set([...slugs, ...current])));
      notify('Your SONIQUE account is ready.', 'success');
    },
    [notify],
  );

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setCustomer(null);
    notify('Signed out. Your basket and saved items stay on this device.', 'info');
  }, [notify]);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const value = useMemo<StoreValue>(() => {
    const subtotalCents = cart.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
    const shippingCents = shippingForSubtotal(subtotalCents);
    return {
      ready,
      catalog,
      cart,
      cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      addToCart,
      setQuantity,
      removeLine,
      clearCart,
      favorites,
      isFavorite,
      toggleFavorite,
      customer,
      refreshCustomer,
      signIn,
      registerAccount,
      signOut,
      toasts,
      notify,
      dismissToast,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      accountOpen,
      setAccountOpen,
    };
  }, [
    ready,
    catalog,
    cart,
    addToCart,
    setQuantity,
    removeLine,
    clearCart,
    favorites,
    isFavorite,
    toggleFavorite,
    customer,
    refreshCustomer,
    signIn,
    registerAccount,
    signOut,
    toasts,
    notify,
    dismissToast,
    cartOpen,
    searchOpen,
    accountOpen,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
