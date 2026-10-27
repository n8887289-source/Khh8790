import { Router } from 'express';
import { query } from '../db.js';
import { PRODUCT_COLUMNS, mapProduct, round, shippingFor } from '../lib/store.js';

export const productsRouter = Router();

const SORTS = {
  featured: 'p.sort_order ASC, p.id ASC',
  'price-asc': 'p.price ASC',
  'price-desc': 'p.price DESC',
  rating: 'p.rating DESC, p.review_count DESC',
  newest: 'p.created_at DESC, p.id DESC',
  name: 'p.name ASC',
};

productsRouter.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT slug, name, tagline, image FROM categories ORDER BY sort_order ASC',
    );
    res.json({ categories: rows });
  } catch (error) {
    next(error);
  }
});

/** Catalogue query: search, category, price range, rating, availability, sort. */
productsRouter.get('/products', async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      rating = '',
      availability = '',
      tab = '',
      sort = 'featured',
    } = req.query;

    const where = [];
    const params = [];

    const trimmedSearch = String(search).trim().slice(0, 80);
    if (trimmedSearch) {
      params.push(`%${trimmedSearch}%`);
      const index = params.length;
      where.push(
        `(p.name ILIKE $${index} OR p.tagline ILIKE $${index} OR p.description ILIKE $${index}
          OR p.category_slug ILIKE $${index} OR c.name ILIKE $${index})`,
      );
    }

    if (String(category).trim()) {
      params.push(String(category).trim().toLowerCase());
      where.push(`p.category_slug = $${params.length}`);
    }

    const min = Number.parseFloat(String(minPrice));
    if (Number.isFinite(min) && min >= 0) {
      params.push(min);
      where.push(`p.price >= $${params.length}`);
    }

    const max = Number.parseFloat(String(maxPrice));
    if (Number.isFinite(max) && max > 0) {
      params.push(max);
      where.push(`p.price <= $${params.length}`);
    }

    const minRating = Number.parseFloat(String(rating));
    if (Number.isFinite(minRating) && minRating > 0) {
      params.push(minRating);
      where.push(`p.rating >= $${params.length}`);
    }

    if (String(availability) === 'in-stock') where.push('p.in_stock = TRUE');
    if (String(availability) === 'out-of-stock') where.push('p.in_stock = FALSE');

    if (String(tab).trim()) {
      params.push(String(tab).trim().toLowerCase());
      where.push(`$${params.length} = ANY (p.tabs)`);
    }

    const orderBy = SORTS[String(sort)] ?? SORTS.featured;
    const sql = `
      SELECT ${PRODUCT_COLUMNS}
      FROM products p
      JOIN categories c ON c.slug = p.category_slug
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const { rows } = await query(sql, params);
    res.json({
      products: rows.map(mapProduct),
      count: rows.length,
      shipping: { flatRate: 9.95, freeOver: 99 },
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/products/:slug', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       JOIN categories c ON c.slug = p.category_slug
       WHERE p.slug = $1`,
      [req.params.slug],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = mapProduct(rows[0]);

    const related = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       JOIN categories c ON c.slug = p.category_slug
       WHERE p.category_slug = $1 AND p.slug <> $2
       ORDER BY p.sort_order ASC
       LIMIT 4`,
      [product.categorySlug, product.slug],
    );

    return res.json({ product, related: related.rows.map(mapProduct) });
  } catch (error) {
    return next(error);
  }
});

/**
 * Prices a cart from the database (never from client-supplied prices) and
 * applies the store shipping rule.
 */
export async function quoteCart(items) {
  const slugs = [...new Set(items.map((item) => String(item?.slug ?? '')).filter(Boolean))];
  if (!slugs.length) {
    return { lines: [], subtotal: 0, shipping: 0, total: 0 };
  }

  const { rows } = await query(
    `SELECT id, slug, name, price, in_stock, images FROM products WHERE slug = ANY ($1)`,
    [slugs],
  );
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  const lines = [];
  for (const item of items) {
    const row = bySlug.get(String(item?.slug ?? ''));
    if (!row) continue;
    const parsed = Number.parseInt(String(item?.quantity ?? 1), 10);
    const quantity = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 10) : 1;
    const unitPrice = Number(row.price);
    lines.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      image: row.images?.[0] ?? '',
      unitPrice,
      quantity,
      lineTotal: round(unitPrice * quantity),
      inStock: row.in_stock,
    });
  }

  const subtotal = round(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const shipping = lines.length ? shippingFor(subtotal) : 0;
  return { lines, subtotal, shipping, total: round(subtotal + shipping) };
}
