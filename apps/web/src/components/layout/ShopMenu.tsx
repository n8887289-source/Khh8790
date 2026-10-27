import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Category, Product } from '../../lib/types';
import { cn } from '../../lib/cn';
import { formatPrice } from '../../lib/format';

type Props = {
  categories: Category[];
};

export const NAV_LINKS = [
  { label: 'Headphones', to: '/shop?category=headphones' },
  { label: 'Earbuds', to: '/shop?category=earbuds' },
  { label: 'Speakers', to: '/shop?category=speakers' },
  { label: 'Amplifiers', to: '/shop?category=amplifiers' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'Explore', to: '/explore' },
];

type ShopMenuProps = {
  categories: Category[];
  label: string;
  open: boolean;
  onOpen: (open: boolean) => void;
  mobile?: boolean;
};

export function ShopMenu({ categories, label, open, onOpen, mobile }: ShopMenuProps) {
  const [preview, setPreview] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pathname, search } = useLocation();

  const loadPreview = useCallback(async () => {
    if (preview.length) return;
    try {
      const data = await api.products({ sort: 'featured' });
      setPreview(data.products.slice(0, 2));
    } catch {
      setPreview([]);
    }
  }, [preview.length]);

  useEffect(() => {
    if (!open) return;
    void loadPreview();
  }, [open, loadPreview]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) onOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onPointerDown);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpen]);

  useEffect(() => {
    onOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  const panelClass = useMemo(
    () =>
      mobile
        ? 'mt-3 space-y-1'
        : 'absolute left-0 top-full z-50 mt-4 w-[min(720px,calc(100vw-64px))] animate-pop',
    [mobile],
  );

  return (
    <div ref={containerRef} className={mobile ? '' : 'relative'}>
      <button
        type="button"
        className={cn(
          'transition',
          mobile
            ? 'flex w-full items-center justify-between py-3 text-lg font-medium'
            : 'text-[13px] text-mute hover:text-paper',
          open && !mobile && 'text-paper',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => onOpen(!open)}
      >
        {label}
        {mobile ? <span aria-hidden="true">{open ? '−' : '+'}</span> : null}
      </button>

      <div className={cn(panelClass, open ? 'block' : 'hidden')}>
        <div className={mobile ? 'border-l border-line pl-4' : 'surface overflow-hidden bg-navy/95 p-2 backdrop-blur'}>
          <div className={mobile ? 'space-y-1' : 'grid grid-cols-[1.15fr_1fr] gap-2'}>
            <ul className={mobile ? 'space-y-1' : 'p-3'}>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 transition',
                      mobile ? 'py-2 text-[15px]' : 'py-2.5 hover:bg-white/[0.05]',
                    )}
                  >
                    <span>
                      <span className="block text-[13.5px] font-medium">{category.name}</span>
                      <span className="block text-[11.5px] text-mute">{category.tagline}</span>
                    </span>
                    <span className="text-mute transition group-hover:translate-x-0.5 group-hover:text-paper" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {!mobile ? (
              <div className="space-y-2 border-l border-line p-3">
                <p className="eyebrow">Featured</p>
                {preview.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/product/${product.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/[0.05]"
                  >
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{product.name}</span>
                      <span className="block text-[12px] text-mute">{formatPrice(product.price)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
