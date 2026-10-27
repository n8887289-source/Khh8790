import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Base>
);

export const UserIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Base>
);

export const CartIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M3 4h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20.5 8H6" />
    <circle cx="9.5" cy="20" r="1.4" />
    <circle cx="17.5" cy="20" r="1.4" />
  </Base>
);

export const HeartIcon = ({ filled = false, ...props }: IconProps & { filled?: boolean }) => (
  <Base {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3c0 5-7.5 9.4-7.5 9.4Z" />
  </Base>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);

export const ArrowUpRightIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Base>
);

export const CloseIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Base>
);

export const MenuIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </Base>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m14 6-6 6 6 6" />
  </Base>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m10 6 6 6-6 6" />
  </Base>
);

export const CheckIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Base>
);

export const PlusIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Base>
);

export const MinusIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M5 12h14" />
  </Base>
);

export const TrashIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
  </Base>
);

export const PlayIcon = (props: IconProps) => (
  <Base {...props} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5z" />
  </Base>
);

export const SlidersIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 7h10" />
    <path d="M18 7h2" />
    <path d="M4 17h4" />
    <path d="M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
);

export const WaveIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M3 12h2l1.6-4.5L9 18l2.6-13L14 16l1.8-4H21" />
  </Base>
);

export const CraftIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3 6 6.5v6c0 4 2.6 6.9 6 8.5 3.4-1.6 6-4.5 6-8.5v-6Z" />
    <path d="m9.5 12 1.8 1.8L15 10" />
  </Base>
);

export const TruckIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M2.5 7h11v9h-11z" />
    <path d="M13.5 10h4l3 3v3h-7" />
    <circle cx="6" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Base>
);

export const DropletIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3s5.5 6.1 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9.1 12 3 12 3Z" />
  </Base>
);

export const BatteryIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="2.5" y="8" width="16" height="8" rx="2" />
    <path d="M21 11v2" />
    <path d="M6 12h6" />
  </Base>
);

export const MountainIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m3 19 6-11 4 7 2.5-4L21 19z" />
  </Base>
);

export const StarIcon = ({ size = 14, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"
    />
  </svg>
);

export const SpinnerIcon = ({ size = 18, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className="animate-spin-slow"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" fill="none" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const LeafIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M20 4C10 4 4.5 8.6 4.5 15.2A4.8 4.8 0 0 0 9.3 20C15.9 20 20 14.5 20 4Z" />
    <path d="M4.5 20c1.4-4.6 4.6-8.2 9.2-10.4" />
  </Base>
);

export const InstagramIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M16.8 7.2h.01" />
  </Base>
);

export const YouTubeIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10.5 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
  </Base>
);

export const TikTokIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M14.5 3v10.6a3.4 3.4 0 1 1-3-3.4" />
    <path d="M14.5 5.2A4 4 0 0 0 18.8 8" />
  </Base>
);

export const XIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 4l16 16" />
    <path d="M20 4 4 20" />
  </Base>
);

export const FacebookIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M14.5 8.5V6.8c0-.8.4-1.3 1.3-1.3h1.7V2.6h-2.6c-2.2 0-3.6 1.5-3.6 3.9v2H9v3h2.3V21h3.2v-9.5h2.6l.4-3z" />
  </Base>
);

export const InfoIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Base>
);
