import type { ReactNode } from 'react';
import { Button } from './Button';
import { SpinnerIcon } from '../../lib/icons';

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  actionLabel,
  actionTo,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  /** Set so the surrounding section can reference it with aria-labelledby. */
  titleId?: string;
  actionLabel?: string;
  actionTo?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end ${
        align === 'center' ? 'sm:justify-center' : 'sm:justify-between'
      }`}
    >
      <div className={align === 'center' ? 'text-center sm:mx-auto' : ''}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 id={titleId} className="text-[26px] leading-tight sm:text-3xl lg:text-[34px]">
          {title}
        </h2>
      </div>
      {actionLabel && actionTo ? (
        <Button to={actionTo} variant="quiet" size="sm" className="self-start sm:self-auto">
          {actionLabel}
          <span aria-hidden="true">→</span>
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface overflow-hidden">
          <div className="aspect-square animate-pulse bg-white/[0.03]" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-mute">
      <SpinnerIcon />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-brand-soft">{icon}</div> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-mute">{description}</p>
      {actionLabel && actionTo ? (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-mute">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
