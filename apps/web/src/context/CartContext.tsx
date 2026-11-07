import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine, Product } from '../lib/types';
import { clampQuantity, shippingFor } from '../lib/format';

const STORAGE_KEY = 'sonique.cart.v1';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  quantityOf: (slug: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line): line is CartLine =>
          typeof line?.slug === 'string' &&
          typeof line?.name === 'string' &&
          Number.isFinite(Number(line?.price)),
      )
      .map((line) => ({
        slug: line.slug,
        name: line.name,
        image: typeof line.image === 'string' ? line.image : '',
        price: Number(line.price),
        quantity: clampQuantity(Number(line.quantity)),
        inStock: line.inStock !== false,
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredCart());

  // The cart is kept on this device so it survives page refreshes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable (private mode) — the cart still works in memory */
    }
  }, [lines]);

  const add = useCallback((product: Product, quantity = 1) => {
    const amount = clampQuantity(quantity);
    setLines((current) => {
      const existing = current.find((line) => line.slug === product.slug);
      if (existing) {
        return current.map((line) =>
          line.slug === product.slug
            ? { ...line, quantity: clampQuantity(line.quantity + amount) }
            : line,
        );
      }
      return [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? '',
          price: product.price,
          quantity: amount,
          inStock: product.inStock,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.slug === slug ? { ...line, quantity: clampQuantity(quantity) } : line,
      ),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;
    const shipping = shippingFor(subtotal);
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      shipping,
      total: Math.round((subtotal + shipping) * 100) / 100,
      add,
      setQuantity,
      remove,
      clear,
      quantityOf: (slug: string) => lines.find((line) => line.slug === slug)?.quantity ?? 0,
    };
  }, [lines, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
