import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCategories } from '../../hooks/useCategories';
import { CartIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon, CloseIcon } from '../../lib/icons';
import { cn } from '../../lib/cn';
import { ShopMenu } from './ShopMenu';
import { SearchOverlay } from './SearchOverlay';
import { CartDrawer } from './CartDrawer';

const ANNOUNCEMENT_LINKS = [
  { label: 'Track Order', to: '/support/track-order' },
  { label: 'Help', to: '/support/faqs' },
];

const PRIMARY_LINKS = [
  { label: 'Headphones', to: '/shop?category=headphones' },
  { label: 'Earbuds', to: '/shop?category=earbuds' },
  { label: 'Speakers', to: '/shop?category=speakers' },
  { label: 'Amplifiers', to: '/shop?category=amplifiers' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'Explore', to: '/explore' },
];

export function Header() {
  const { categories } = useCategories();
  const cart = useCart();
  const favorites = useFavorites();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickFind, setQuickFind] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const overHero = pathname === '/' && !scrolled && !menuOpen;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-[70]">
        {/* Announcement bar */}
        <div className="border-b border-line bg-ink">
          <div className="shell flex h-8 items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-mute">
            <div className="flex items-center gap-3 truncate">
              <span className="truncate">Free shipping on orders over $99</span>
              <span aria-hidden="true" className="hidden text-line md:inline">
                |
              </span>
              <span className="hidden truncate md:inline">A higher standard of sound</span>
            </div>
            <div className="hidden shrink-0 items-center gap-5 sm:flex">
              {ANNOUNCEMENT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="transition hover:text-paper link-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div
          className={cn(
            'transition-colors duration-300',
            overHero
              ? 'bg-gradient-to-b from-ink/85 to-transparent'
              : 'border-b border-line bg-ink/90 backdrop-blur-xl',
          )}
        >
          <div className="shell">
            <div className="flex h-[60px] items-center justify-between gap-3 lg:h-[66px]">
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  className="icon-btn"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-nav"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
                </button>
              </div>

              <Link
                to="/"
                className="text-[15px] font-semibold uppercase tracking-[0.34em] text-paper transition hover:text-white lg:text-base"
                aria-label="SONIQUE home"
              >
                Sonique
              </Link>

              <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:gap-7">
                <ShopMenu
                  categories={categories}
                  label="Shop"
                  open={shopOpen}
                  onOpen={setShopOpen}
                />
                {PRIMARY_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-[13px] text-mute transition hover:text-paper"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search products"
                >
                  <SearchIcon size={18} />
                </button>
                <Link to="/favorites" className="icon-btn relative" aria-label="Favourites">
                  <HeartIcon size={18} filled={favorites.count > 0} />
                  {favorites.count > 0 ? (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {favorites.count}
                    </span>
                  ) : null}
                </Link>
                <Link to="/account" className="icon-btn hidden sm:inline-flex" aria-label="Account">
                  <UserIcon size={18} />
                </Link>
                <button
                  type="button"
                  className="icon-btn relative"
                  onClick={() => setCartOpen(true)}
                  aria-label={`Open cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`}
                >
                  <CartIcon size={18} />
                  {cart.count > 0 ? (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {cart.count}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          id="mobile-nav"
          hidden={!menuOpen}
          className="max-h-[calc(100vh-6.25rem)] overflow-y-auto border-b border-line bg-ink/98 backdrop-blur-xl lg:hidden"
        >
          <div className="shell space-y-5 py-6">
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                const term = quickFind.trim();
                navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
                setMenuOpen(false);
              }}
            >
              <label htmlFor="mobile-search" className="eyebrow">
                Search
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="mobile-search"
                  type="search"
                  value={quickFind}
                  onChange={(event) => setQuickFind(event.target.value)}
                  placeholder="Search the collection"
                  className="field"
                />
                <button type="submit" className="btn btn-outline px-4" aria-label="Submit search">
                  <SearchIcon size={16} />
                </button>
              </div>
            </form>

            <nav aria-label="Mobile" className="space-y-1 border-t border-line pt-4">
              <ShopMenu
                mobile
                categories={categories}
                label="Shop"
                open={shopOpen}
                onOpen={setShopOpen}
              />
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block py-3 text-lg font-medium transition hover:text-brand-soft"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap gap-3 border-t border-line pt-5">
              <Link to="/favorites" className="btn btn-outline">
                Favourites{favorites.count > 0 ? ` (${favorites.count})` : ''}
              </Link>
              <Link to="/account" className="btn btn-outline">
                Account
              </Link>
              <Link to="/support/track-order" className="btn btn-outline">
                Track order
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
