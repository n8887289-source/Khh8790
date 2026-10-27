/**
 * Order pricing rules for the SONIQUE store (shared server-side source of truth).
 * The storefront mirrors these numbers in frontend/src/lib/format.ts for instant
 * cart feedback; the server always recomputes - never trust client totals.
 */
export const SHIPPING_FLAT_CENTS = 1200;
export const FREE_SHIPPING_THRESHOLD_CENTS = 9900;
export const MAX_QUANTITY_PER_ITEM = 10;

export function shippingForSubtotal(subtotalCents) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

export function totalsForSubtotal(subtotalCents) {
  const shippingCents = shippingForSubtotal(subtotalCents);
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
}

export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}
