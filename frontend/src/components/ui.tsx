import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

/** Fades content in as it enters the viewport (disabled by prefers-reduced-motion). */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.5}
          className={index < rounded ? 'fill-gold text-gold' : 'text-graphite'}
        />
      ))}
    </span>
  );
}

export function RatingLine({
  rating,
  reviewCount,
  className = '',
}: {
  rating: number;
  reviewCount: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-mist ${className}`}>
      <Stars rating={rating} />
      <span className="text-ink/80">{rating.toFixed(1)}</span>
      <span>({reviewCount.toLocaleString('en-US')})</span>
    </span>
  );
}

export function ProductBadge({ label }: { label: string }) {
  const tone =
    label.toLowerCase() === 'limited'
      ? 'border-violet/50 bg-violet/20 text-white'
      : label.toLowerCase() === 'new'
        ? 'border-sonic/50 bg-sonic/20 text-white'
        : 'border-graphite bg-white/10 text-white';
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest ${tone}`}
    >
      {label}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  actionTo,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  actionTo?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div>
        {eyebrow ? <p className="label-xs mb-3">{eyebrow}</p> : null}
        <h2 className="text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      </div>
      {action && actionTo ? (
        <Link
          to={actionTo}
          className="group inline-flex items-center gap-2 text-sm text-mist transition hover:text-ink"
        >
          {action}
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-mist">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn-primary btn-sm mt-2">
          {actionLabel}
          <ArrowRight size={15} />
        </Link>
      ) : null}
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-mist" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-graphite border-t-violet" />
      {label}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-white/[0.04]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.05]" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function SampleDataNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-mist/80">
      <span className="text-mist/60">Sample demonstration data — </span>
      {children}
    </p>
  );
}
