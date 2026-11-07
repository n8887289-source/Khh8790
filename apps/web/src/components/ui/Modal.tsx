import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from '../../lib/icons';
import { classNames } from '../../lib/format';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Hide the visible title when the panel already shows its own heading. */
  hideTitle?: boolean;
  className?: string;
  labelledBy?: string;
  placement?: 'center' | 'right';
};

/**
 * Accessible modal: labelled dialog, Escape to close, focus moved into the
 * panel and restored on close, background scroll locked while open.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  hideTitle,
  className,
  labelledBy,
  placement = 'center',
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = labelledBy ?? 'sonique-modal-title';

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>(
        'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? panelRef.current;
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const isRight = placement === 'right';

  return (
    <div
      className={classNames(
        'fixed inset-0 z-[90] flex',
        isRight
          ? 'justify-end'
          : 'items-start justify-center overflow-y-auto p-4 sm:items-center',
      )}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="animate-fade fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={hideTitle ? title : undefined}
        aria-labelledby={hideTitle ? undefined : titleId}
        tabIndex={-1}
        className={classNames(
          'surface relative z-10 bg-navy/95 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)]',
          isRight
            ? 'animate-slide-in ml-auto flex h-full w-full max-w-[26rem] flex-col rounded-none border-y-0 border-r-0'
            : 'animate-pop my-auto w-full',
          !isRight && (className ?? 'max-w-lg'),
          isRight && className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className={classNames('text-base font-semibold', hideTitle && 'sr-only')}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-2 -mt-1 h-9 w-9"
            aria-label="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className={isRight ? 'min-h-0 flex-1 overflow-y-auto px-5 py-5' : 'px-5 py-5'}>
          {children}
        </div>
      </div>
    </div>
  );
}
