import { StarIcon } from '../../lib/icons';
import { classNames } from '../../lib/format';

type Props = {
  rating: number;
  size?: number;
  className?: string;
};

/**
 * Five star rating. The fill width of each star is clamped to the score so a
 * 4.7 shows as a partial fifth star without relying on colour alone.
 */
export function StarRating({ rating, size = 13, className }: Props) {
  const clamped = Math.min(Math.max(rating, 0), 5);

  return (
    <span
      className={classNames('inline-flex items-center gap-[3px] text-[#FFC93C]', className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((step) => {
        const fill = Math.min(Math.max(clamped - (step - 1), 0), 1);
        return (
          <span key={step} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} className="absolute inset-0 text-white/15" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
              aria-hidden="true"
            >
              <StarIcon size={size} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
