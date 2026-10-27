/** Tiny class name joiner used across the storefront. */
export function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(' ');
}
