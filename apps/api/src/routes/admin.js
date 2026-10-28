// Admin API: catalogue, orders and audience management.
//
// Everything behind /admin (except sign-in and the one-time account setup) is
// protected by requireAdmin, so the guard is server-side and not a hidden button.
import { Router } from 'express';
import { query } from '../db.js';
import { PRODUCT_COLUMNS, mapProduct, rateLimit, text } from '../lib/store.js';
import {
  adminConfigured,
  adminFromRequest,
  clearSessionCookie,
  hashPassword,
  requireAdmin,
  setSessionCookie,
  verifyPassword,
} from '../lib/adminAuth.js';

export const adminRouter = Router();

export const ORDER_STATUSES = [
  'demo_unpaid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const TABS = ['bestseller', 'new', 'premium'];

const limited = rateLimit({ max: 12 });

function isEmailish(value) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return [];
}

function asSpecs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      label: text(item?.label, 60),
      value: text(item?.value, 120),
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 20);
}

/** Validates a product payload. `partial` allows PATCH-style updates. */
async function readProduct(body, { partial = false } = {}) {
  const problems = {};
  const values = {};

  const name = body?.name === undefined ? undefined : text(body.name, 120);
  if (name !== undefined || !partial) {
    if (!name || name.length < 2) problems.name = 'Enter a product name.';
    else values.name = name;
  }

  if (body?.slug !== undefined || !partial) {
    const slug = slugify(body?.slug ? String(body.slug) : name ?? '');
    if (!slug || slug.length < 2) problems.slug = 'Enter a valid web address for the product.';
    else values.slug = slug;
  }

  if (body?.categorySlug !== undefined || !partial) {
    const categorySlug = text(body?.categorySlug, 60).toLowerCase();
    const { rows } = await query('SELECT slug FROM categories WHERE slug = $1', [categorySlug]);
    if (!rows.length) problems.categorySlug = 'Choose an existing category.';
    else values.category_slug = categorySlug;
  }

  if (body?.price !== undefined || !partial) {
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
      problems.price = 'Enter a price of 0 or more.';
    } else values.price = Math.round(price * 100) / 100;
  }

  if (body?.compareAtPrice !== undefined) {
    if (body.compareAtPrice === null || body.compareAtPrice === '') {
      values.compare_at_price = null;
    } else {
      const compare = Number(body.compareAtPrice);
      if (!Number.isFinite(compare) || compare < 0) problems.compareAtPrice = 'Enter a valid compare-at price.';
      else values.compare_at_price = Math.round(compare * 100) / 100;
    }
  }

  if (body?.tagline !== undefined) values.tagline = text(body.tagline, 200);
  if (body?.description !== undefined) values.description = text(body.description, 4000);

  if (body?.badge !== undefined) {
    const badge = text(body.badge, 40);
    values.badge = badge || null;
  }

  if (body?.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) problems.rating = 'Rating must be between 0 and 5.';
    else values.rating = Math.round(rating * 10) / 10;
  }

  if (body?.reviewCount !== undefined) {
    const count = Number.parseInt(String(body.reviewCount), 10);
    if (!Number.isFinite(count) || count < 0) problems.reviewCount = 'Review count must be 0 or more.';
    else values.review_count = count;
  }

  if (body?.inStock !== undefined) values.in_stock = Boolean(body.inStock);

  if (body?.sortOrder !== undefined) {
    const order = Number.parseInt(String(body.sortOrder), 10);
    values.sort_order = Number.isFinite(order) ? order : 0;
  }

  if (body?.colors !== undefined) {
    values.colors = asArray(body.colors).map((color) => color.slice(0, 40)).slice(0, 12);
  }

  if (body?.images !== undefined) {
    const images = asArray(body.images).slice(0, 8);
    const invalid = images.find((image) => !/^(https?:\/\/|\/)/.test(image));
    if (invalid) problems.images = 'Image paths must start with / or https://';
    else values.images = images;
  }

  if (body?.specs !== undefined) values.specs = JSON.stringify(asSpecs(body.specs));

  if (body?.tabs !== undefined) {
    values.tabs = asArray(body.tabs)
      .map((tab) => tab.toLowerCase())
      .filter((tab) => TABS.includes(tab));
  }

  return { problems, values };
}

function failure(res, problems) {
  return res.status(400).json({
    error: 'Please check the highlighted fields.',
    fields: problems,
  });
}

async function productById(id) {
  const { rows } = await query(
    `SELECT ${PRODUCT_COLUMNS}
     FROM products p JOIN categories c ON c.slug = p.category_slug
     WHERE p.id = $1`,
    [id],
  );
  return rows[0] ? mapProduct(rows[0]) : null;
}

/* ---------------------------------------------------------------- session -- */

adminRouter.get('/admin/session', limited, async (req, res, next) => {
  try {
    const configured = adminConfigured();
    const { rows } = await query('SELECT COUNT(*)::int AS count FROM admin_users');
    const hasAccount = rows[0].count > 0;
    const admin = configured && hasAccount ? await adminFromRequest(req) : null;

    res.json({
      configured,
      hasAccount,
      authenticated: Boolean(admin),
      email: admin?.email ?? null,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/admin/setup', limited, async (req, res, next) => {
  try {
    if (!adminConfigured()) {
      return res.status(503).json({
        error: 'Admin sign-in is not configured on this deployment (SESSION_SECRET is missing).',
      });
    }

    const { rows } = await query('SELECT COUNT(*)::int AS count FROM admin_users');
    if (rows[0].count > 0) {
      return res.status(409).json({ error: 'An administrator account already exists. Sign in instead.' });
    }

    const email = text(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const problems = {};
    if (!isEmailish(email)) problems.email = 'Enter a valid email address.';
    if (password.length < 10) problems.password = 'Use a password of at least 10 characters.';
    if (Object.keys(problems).length) return failure(res, problems);

    const inserted = await query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashPassword(password)],
    );

    setSessionCookie(req, res, inserted.rows[0].id);
    return res.status(201).json({ email: inserted.rows[0].email });
  } catch (error) {
    return next(error);
  }
});

adminRouter.post('/admin/login', limited, async (req, res, next) => {
  try {
    if (!adminConfigured()) {
      return res.status(503).json({
        error: 'Admin sign-in is not configured on this deployment (SESSION_SECRET is missing).',
      });
    }

    const email = text(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const { rows } = await query('SELECT id, email, password_hash FROM admin_users WHERE email = $1', [
      email,
    ]);

    if (!rows.length || !verifyPassword(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'That email and password do not match.' });
    }

    setSessionCookie(req, res, rows[0].id);
    return res.json({ email: rows[0].email });
  } catch (error) {
    return next(error);
  }
});

adminRouter.post('/admin/logout', (req, res) => {
  clearSessionCookie(req, res);
  res.json({ status: 'signed_out' });
});

/* --------------------------------------------------------------- products -- */

adminRouter.get('/admin/products', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p JOIN categories c ON c.slug = p.category_slug
       ORDER BY p.sort_order ASC, p.id ASC`,
    );
    res.json({ products: rows.map(mapProduct) });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/admin/products', requireAdmin, async (req, res, next) => {
  try {
    const { problems, values } = await readProduct(req.body);
    if (Object.keys(problems).length) return failure(res, problems);

    const inserted = await query(
      `INSERT INTO products
         (name, slug, category_slug, tagline, description, price, compare_at_price, badge,
          rating, review_count, in_stock, colors, specs, images, tabs, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::text[], $13::jsonb,
               $14::text[], $15::text[], $16)
       RETURNING id`,
      [
        values.name,
        values.slug,
        values.category_slug,
        values.tagline ?? '',
        values.description ?? '',
        values.price,
        values.compare_at_price ?? null,
        values.badge ?? null,
        values.rating ?? 0,
        values.review_count ?? 0,
        values.in_stock ?? true,
        values.colors ?? [],
        values.specs ?? '[]',
        values.images ?? [],
        values.tabs ?? [],
        values.sort_order ?? 0,
      ],
    );

    return res.status(201).json({ product: await productById(inserted.rows[0].id) });
  } catch (error) {
    if (error?.code === '23505') {
      return failure(res, { slug: 'That web address is already used by another product.' });
    }
    return next(error);
  }
});

adminRouter.patch('/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Unknown product.' });

    const { problems, values } = await readProduct(req.body, { partial: true });
    if (Object.keys(problems).length) return failure(res, problems);

    const columns = Object.keys(values);
    if (!columns.length) return res.status(400).json({ error: 'Nothing to update.' });

    const assignments = columns.map((column, index) => {
      const cast = column === 'colors' ? '::text[]' : column === 'specs' ? '::jsonb' : column === 'images' ? '::text[]' : column === 'tabs' ? '::text[]' : '';
      return `${column} = $${index + 1}${cast}`;
    });

    const updated = await query(
      `UPDATE products SET ${assignments.join(', ')} WHERE id = $${columns.length + 1} RETURNING id`,
      [...columns.map((column) => values[column]), id],
    );

    if (!updated.rows.length) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ product: await productById(id) });
  } catch (error) {
    if (error?.code === '23505') {
      return failure(res, { slug: 'That web address is already used by another product.' });
    }
    return next(error);
  }
});

adminRouter.delete('/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Unknown product.' });
    const deleted = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (!deleted.rows.length) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ status: 'deleted', id });
  } catch (error) {
    return next(error);
  }
});

/* ----------------------------------------------------------------- orders -- */

adminRouter.get('/admin/orders', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT o.id, o.order_number, o.customer_name, o.customer_email, o.subtotal, o.shipping,
              o.total, o.status, o.created_at,
              COALESCE(SUM(i.quantity), 0)::int AS item_count
       FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`,
    );
    res.json({
      orders: rows.map((row) => ({
        orderNumber: row.order_number,
        name: row.customer_name,
        email: row.customer_email,
        subtotal: Number(row.subtotal),
        shipping: Number(row.shipping),
        total: Number(row.total),
        status: row.status,
        placedAt: row.created_at,
        itemCount: row.item_count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/admin/orders/:orderNumber', requireAdmin, async (req, res, next) => {
  try {
    const status = text(req.body?.status, 30).toLowerCase();
    if (!ORDER_STATUSES.includes(status)) {
      return failure(res, { status: 'Choose a valid order status.' });
    }

    const updated = await query(
      'UPDATE orders SET status = $1 WHERE order_number = $2 RETURNING order_number, status',
      [status, req.params.orderNumber],
    );

    if (!updated.rows.length) return res.status(404).json({ error: 'Order not found.' });
    return res.json({ status: updated.rows[0].status, orderNumber: updated.rows[0].order_number });
  } catch (error) {
    return next(error);
  }
});

/* --------------------------------------------------------------- audience -- */

adminRouter.get('/admin/subscribers', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT email, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 200',
    );
    res.json({ subscribers: rows.map((row) => ({ email: row.email, joinedAt: row.created_at })) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/admin/messages', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT name, email, topic, message, created_at FROM contact_messages
       ORDER BY created_at DESC LIMIT 100`,
    );
    res.json({
      messages: rows.map((row) => ({
        name: row.name,
        email: row.email,
        topic: row.topic,
        message: row.message,
        sentAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});
