/** Money + store-rule helpers shared by the whole storefront. */

// Kept in sync with backend/src/pricing.js - the server always recomputes totals.
export const SHIPPING_FLAT_CENTS = 1200;
export const FREE_SHIPPING_THRESHOLD_CENTS = 9900;
export const MAX_QUANTITY_PER_ITEM = 10;

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export function shippingForSubtotal(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function clampQuantity(quantity: number, stock: number): number {
  const ceiling = Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, stock > 0 ? stock : 1));
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.round(quantity), 1), ceiling);
}
