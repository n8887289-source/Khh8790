// Shared helpers for request validation and store rules.

export const SHIPPING_FLAT_RATE = 9.95;
export const FREE_SHIPPING_THRESHOLD = 99;

/** Store shipping rule: free on orders of $99 or more, otherwise a flat rate. */
export function shippingFor(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
}

export function round(value) {
  return Math.round(value * 100) / 100;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function isEmail(value) {
  return typeof value === 'string' && value.trim().length <= 254 && EMAIL_PATTERN.test(value.trim());
}

export function text(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/** Normalises a quantity to a whole number inside the allowed range. */
export function quantity(value, { min = 1, max = 10 } = {}) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
}

/** Small in-memory limiter — enough to stop accidental hammering of writes. */
export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }
    return next();
  };
}

/** Maps a database product row to the JSON shape the storefront consumes. */
export function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    categoryName: row.category_name ?? row.category_slug,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    badge: row.badge,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    inStock: row.in_stock,
    colors: row.colors ?? [],
    specs: row.specs ?? [],
    images: row.images ?? [],
    tabs: row.tabs ?? [],
  };
}

export const PRODUCT_COLUMNS = `
  p.id, p.slug, p.name, p.category_slug, p.tagline, p.description, p.price,
  p.compare_at_price, p.badge, p.rating, p.review_count, p.in_stock, p.colors,
  p.specs, p.images, p.tabs, p.sort_order, p.created_at, c.name AS category_name
`;
