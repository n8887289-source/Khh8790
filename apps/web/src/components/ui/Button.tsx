import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'outline' | 'quiet';
type Size = 'md' | 'lg' | 'sm';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
};

type Props = CommonProps & {
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
};

const base =
  'btn focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-45 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  quiet: 'btn-quiet px-2',
};

const sizes: Record<Size, string> = {
  sm: 'text-[12px] px-4 py-2',
  md: '',
  lg: 'text-[14px] px-7 py-3.5',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth,
  to,
  href,
  onClick,
  type = 'button',
  disabled,
  ariaLabel,
  title,
}: Props) {
  const classes = classNames(
    base,
    variants[variant],
    size !== 'md' && sizes[size],
    fullWidth && 'w-full',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel} title={title} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        title={title}
        rel="noreferrer noopener"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}
