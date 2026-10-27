import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'sonique.favorites.v1';

type FavoritesContextValue = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  /** Returns true when the product is now saved. */
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

/**
 * Favourites are held on this device, which is the storage this store has
 * without a sign-in service: they persist across refreshes on the same browser.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(() => readStored());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      /* storage unavailable — favourites still work for this session */
    }
  }, [slugs]);

  const toggle = useCallback((slug: string) => {
    let saved = false;
    setSlugs((current) => {
      if (current.includes(slug)) {
        saved = false;
        return current.filter((value) => value !== slug);
      }
      saved = true;
      return [...current, slug];
    });
    return saved;
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((current) => current.filter((value) => value !== slug));
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      slugs,
      count: slugs.length,
      has: (slug: string) => slugs.includes(slug),
      toggle,
      remove,
    }),
    [slugs, toggle, remove],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
