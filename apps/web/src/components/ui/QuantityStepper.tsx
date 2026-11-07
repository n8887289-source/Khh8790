import { MinusIcon, PlusIcon } from '../../lib/icons';
import { clampQuantity } from '../../lib/format';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: 'sm' | 'md';
};

/** Quantity control shared by the product page and the cart. */
export function QuantityStepper({ value, onChange, min = 1, max = 10, label, size = 'md' }: Props) {
  const step = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-ink/70">
      <button
        type="button"
        className={`${step} inline-flex items-center justify-center rounded-full text-mute transition hover:text-paper disabled:opacity-35`}
        onClick={() => onChange(clampQuantity(value - 1, min, max))}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <MinusIcon size={15} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value.replace(/[^0-9]/g, ''), 10);
          onChange(Number.isFinite(parsed) ? clampQuantity(parsed, min, max) : min);
        }}
        onBlur={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(parsed) ? clampQuantity(parsed, min, max) : min);
        }}
        className={`${size === 'sm' ? 'w-9' : 'w-11'} bg-transparent text-center text-sm font-semibold tabular-nums focus:outline-none`}
        aria-label={`Quantity of ${label}`}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <button
        type="button"
        className={`${step} inline-flex items-center justify-center rounded-full text-mute transition hover:text-paper disabled:opacity-35`}
        onClick={() => onChange(clampQuantity(value + 1, min, max))}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon size={15} />
      </button>
    </div>
  );
}
