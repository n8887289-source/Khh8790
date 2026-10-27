import { Router } from 'express';
import { query } from '../db.js';
import { asString, asyncHandler } from '../http.js';

const router = Router();

export function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_slug,
    categoryName: row.category_name ?? row.category_slug,
    subtitle: row.subtitle,
    description: row.description,
    priceCents: row.price_cents,
    badge: row.badge,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    inStock: row.stock > 0,
    image: row.image,
    images: row.images ?? [],
    colors: row.colors ?? [],
    specs: row.specs ?? [],
    isBestseller: row.is_bestseller,
    isNew: row.is_new,
    isPremium: row.is_premium,
    releasedAt: row.released_at,
  };
}

const SORTS = {
  featured: 'p.is_bestseller DESC, p.is_premium DESC, p.rating DESC, p.released_at DESC',
  'price-asc': 'p.price_cents ASC',
  'price-desc': 'p.price_cents DESC',
  rating: 'p.rating DESC, p.review_count DESC',
  newest: 'p.released_at DESC',
};

const TABS = {
  bestsellers: 'p.is_bestseller',
  new: 'p.is_new',
  premium: 'p.is_premium',
};

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name
  FROM products p
  JOIN categories c ON c.slug = p.category_slug
`;

/** @param {Record<string, unknown>} q parsed query string (Express gives a plain object) */
function buildFilters(q) {
  const conditions = [];
  const values = [];

  const search = asString(q.q, { max: 120 });
  if (search) {
    values.push(`%${search}%`);
    const idx = values.length;
    conditions.push(
      `(p.name ILIKE $${idx} OR p.subtitle ILIKE $${idx} OR p.description ILIKE $${idx} OR c.name ILIKE $${idx} OR p.category_slug ILIKE $${idx})`,
    );
  }

  const category = asString(q.category, { max: 60 });
  if (category && category !== 'all') {
    values.push(category);
    conditions.push(`p.category_slug = $${values.length}`);
  }

  const minPrice = Number(q.minPrice);
  if (Number.isFinite(minPrice) && minPrice > 0) {
    values.push(Math.round(minPrice * 100));
    conditions.push(`p.price_cents >= $${values.length}`);
  }

  const maxPrice = Number(q.maxPrice);
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    values.push(Math.round(maxPrice * 100));
    conditions.push(`p.price_cents <= $${values.length}`);
  }

  const minRating = Number(q.minRating);
  if (Number.isFinite(minRating) && minRating > 0) {
    values.push(minRating);
    conditions.push(`p.rating >= $${values.length}`);
  }

  const inStock = asString(q.inStock, { max: 5 });
  if (inStock === '1' || inStock === 'true') {
    conditions.push('p.stock > 0');
  }

  const tab = asString(q.tab, { max: 20 });
  if (TABS[tab]) conditions.push(TABS[tab]);

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
}

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT c.*, count(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_slug = c.slug
      GROUP BY c.slug
      ORDER BY c.sort_order ASC
    `);
    res.json({
      categories: rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        blurb: row.blurb,
        image: row.image,
        productCount: row.product_count,
      })),
    });
  }),
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { where, values } = buildFilters(req.query);
    const sort = SORTS[asString(req.query.sort, { max: 20 })] || SORTS.featured;
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 120) : 60;

    const { rows } = await query(`${BASE_SELECT} ${where} ORDER BY ${sort} LIMIT ${limit}`, values);
    res.json({ products: rows.map(mapProduct), total: rows.length });
  }),
);

router.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${BASE_SELECT} WHERE p.slug = $1`, [req.params.slug]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const product = mapProduct(rows[0]);
    const related = await query(
      `${BASE_SELECT} WHERE p.category_slug = $1 AND p.slug <> $2
       ORDER BY p.is_bestseller DESC, p.rating DESC, p.id ASC LIMIT 4`,
      [product.category, product.slug],
    );
    res.json({ product, related: related.rows.map(mapProduct) });
  }),
);

export default router;
