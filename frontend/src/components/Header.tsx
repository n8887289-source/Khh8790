import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { api, type Category } from '../lib/api';
import { useBodyLock, useEscapeKey, useScrolled } from '../lib/hooks';
import { useStore } from '../store/StoreContext';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop', menu: true },
  { label: 'Headphones', to: '/shop?category=headphones' },
  { label: 'Earbuds', to: '/shop?category=earbuds' },
  { label: 'Speakers', to: '/shop?category=speakers' },
  { label: 'Amplifiers', to: '/shop?category=amplifiers' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'Explore', to: '/explore' },
];

export function Header() {
  const { cartCount, setCartOpen, setSearchOpen, setAccountOpen, favorites, customer } = useStore();
  const scrolled = useScrolled(40);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useBodyLock(menuOpen);

  useEffect(() => {
    let cancelled = false;
    api
      .categories()
      .then(({ categories: rows }) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(timer);
  }, [cartCount]);

  useEscapeKey(shopOpen, () => setShopOpen(false));

  useEffect(() => {
    if (!shopOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShopOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [shopOpen]);

  return (
    <>
      <div className="border-b border-graphite bg-midnight text-[11px] text-mist">
        <div className="shell flex h-9 items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="whitespace-nowrap uppercase tracking-widest">
              Free shipping on orders over $99
            </span>
            <span className="hidden h-3 w-px bg-graphite sm:block" aria-hidden="true" />
            <span className="hidden whitespace-nowrap uppercase tracking-widest sm:inline">
              A higher standard of sound
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hidden whitespace-nowrap uppercase tracking-widest transition hover:text-ink sm:inline">
              Track order
            </Link>
            <Link to="/faq" className="whitespace-nowrap uppercase tracking-widest transition hover:text-ink">
              Help
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          scrolled ? 'glass border-graphite' : 'border-transparent bg-void/40 backdrop-blur-sm'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-2 lg:gap-6">
            <button
              type="button"
              className="icon-btn lg:hidden"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Link
              to="/"
              className="whitespace-nowrap text-base font-semibold uppercase tracking-[0.22em] text-ink transition hover:text-white sm:text-lg sm:tracking-[0.42em]"
            >
              Sonique
            </Link>
          </div>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex" ref={menuRef}>
            {NAV_LINKS.map((link) =>
              link.menu ? (
                <div key={link.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setShopOpen((open) => !open)}
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                    className="rounded-full px-3 py-2 text-[13px] text-mist transition hover:bg-white/[0.05] hover:text-ink"
                  >
                    {link.label}
                  </button>
                  {shopOpen ? (
                    <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(90vw,46rem)] -translate-x-1/2 animate-scale-in rounded-2xl border border-graphite bg-midnight/95 p-5 shadow-2xl backdrop-blur-xl">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="label-xs">Shop by category</p>
                        <Link
                          to="/shop"
                          className="inline-flex items-center gap-1.5 text-xs text-mist transition hover:text-ink"
                        >
                          View all products <ArrowRight size={13} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            to={`/shop?category=${category.slug}`}
                            className="group flex items-center gap-3 rounded-xl border border-graphite/70 bg-abyss/60 p-3 transition hover:border-violet/50 hover:bg-abyss"
                          >
                            <img
                              src={category.image}
                              alt=""
                              className="h-11 w-11 rounded-lg object-cover"
                              loading="lazy"
                            />
                            <span>
                              <span className="block text-[13px] font-medium text-ink">
                                {category.name}
                              </span>
                              <span className="block text-[11px] text-mist">
                                {category.productCount} products
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-full px-3 py-2 text-[13px] text-mist transition hover:bg-white/[0.05] hover:text-ink"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-0 lg:gap-1">
            <button
              type="button"
              className="icon-btn"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </button>
            {/* Saved items stay reachable from the mobile menu, which keeps the bar inside 320px. */}
            <Link to="/favorites" className="icon-btn relative hidden sm:inline-flex" aria-label="Saved items">
              <Heart size={18} />
              {favorites.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-violet px-1 text-[10px] font-semibold text-white">
                  {favorites.length}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label={customer ? `Account: ${customer.email}` : 'Account'}
              onClick={() => setAccountOpen(true)}
            >
              <User size={18} />
            </button>
            <button
              type="button"
              className="icon-btn relative"
              aria-label={`Cart, ${cartCount} items`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 ? (
                <span
                  className={`absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-violet px-1 text-[10px] font-semibold text-white ${
                    pulse ? 'animate-badge-pulse' : ''
                  }`}
                  data-testid="cart-count"
                >
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-graphite bg-midnight">
            <div className="flex h-16 items-center justify-between border-b border-graphite px-5">
              <span className="text-sm font-semibold uppercase tracking-[0.4em]">Sonique</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close navigation"
                onClick={() => setMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] text-ink transition hover:bg-white/[0.05]"
                    >
                      {link.label}
                      <ArrowRight size={15} className="text-mist" />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="label-xs mt-8 mb-3">Categories</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/shop?category=${category.slug}`}
                    className="overflow-hidden rounded-xl border border-graphite bg-abyss"
                  >
                    <img
                      src={category.image}
                      alt=""
                      className="h-20 w-full object-cover"
                      loading="lazy"
                    />
                    <span className="block px-3 py-2 text-xs font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-2">
                <Link to="/favorites" className="btn-outline btn-sm justify-between">
                  Saved items ({favorites.length}) <Heart size={15} />
                </Link>
                <Link to="/track-order" className="btn-ghost btn-sm justify-start">
                  Track order
                </Link>
                <Link to="/faq" className="btn-ghost btn-sm justify-start">
                  Help & FAQs
                </Link>
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
