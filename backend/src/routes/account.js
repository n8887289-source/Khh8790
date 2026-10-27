import { Router } from 'express';
import {
  clearSessionCookie,
  hashPassword,
  parseSessionCookie,
  setSessionCookie,
  verifyPassword,
} from '../auth.js';
import { query } from '../db.js';
import { asString, asyncHandler } from '../http.js';
import { isValidEmail } from '../pricing.js';

const router = Router();

function publicCustomer(row) {
  return { id: row.id, email: row.email, name: row.name, createdAt: row.created_at };
}

/** Attaches req.customer for any request carrying a valid session cookie. */
export async function loadCustomer(req, _res, next) {
  try {
    const id = parseSessionCookie(req.headers.cookie);
    if (!id) return next();
    const { rows } = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (rows.length > 0) req.customer = publicCustomer(rows[0]);
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireCustomer(req, res, next) {
  if (!req.customer) {
    res.status(401).json({ error: 'Sign in to use saved items.' });
    return;
  }
  next();
}

router.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const email = asString(req.body?.email, { max: 200 }).toLowerCase();
    const name = asString(req.body?.name, { max: 120 });
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const existing = await query('SELECT id FROM customers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }

    const { rows } = await query(
      `INSERT INTO customers (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
      [email, name, hashPassword(password)],
    );
    setSessionCookie(res, rows[0].id);
    res.status(201).json({ customer: publicCustomer(rows[0]) });
  }),
);

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const email = asString(req.body?.email, { max: 200 }).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const { rows } = await query('SELECT * FROM customers WHERE email = $1', [email]);
    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      res.status(401).json({ error: 'Email or password is incorrect.' });
      return;
    }
    setSessionCookie(res, rows[0].id);
    res.json({ customer: publicCustomer(rows[0]) });
  }),
);

router.post('/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/auth/me', (req, res) => {
  res.json({ customer: req.customer ?? null });
});

router.get(
  '/favorites',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT p.slug FROM favorites f JOIN products p ON p.id = f.product_id
       WHERE f.customer_id = $1 ORDER BY f.created_at DESC`,
      [req.customer.id],
    );
    res.json({ slugs: rows.map((row) => row.slug) });
  }),
);

router.post(
  '/favorites',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const slug = asString(req.body?.slug, { max: 120 });
    const product = await query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (product.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    await query(
      `INSERT INTO favorites (customer_id, product_id) VALUES ($1, $2)
       ON CONFLICT (customer_id, product_id) DO NOTHING`,
      [req.customer.id, product.rows[0].id],
    );
    res.status(201).json({ ok: true, slug });
  }),
);

router.delete(
  '/favorites/:slug',
  requireCustomer,
  asyncHandler(async (req, res) => {
    await query(
      `DELETE FROM favorites f USING products p
       WHERE f.product_id = p.id AND p.slug = $1 AND f.customer_id = $2`,
      [req.params.slug, req.customer.id],
    );
    res.json({ ok: true, slug: req.params.slug });
  }),
);

/** Merges the guest (localStorage) favourites into the signed-in account once. */
router.post(
  '/favorites/sync',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const slugs = Array.isArray(req.body?.slugs) ? req.body.slugs.slice(0, 200) : [];
    const clean = slugs.map((slug) => asString(slug, { max: 120 })).filter(Boolean);
    if (clean.length > 0) {
      await query(
        `INSERT INTO favorites (customer_id, product_id)
         SELECT $1, p.id FROM products p WHERE p.slug = ANY($2::text[])
         ON CONFLICT (customer_id, product_id) DO NOTHING`,
        [req.customer.id, clean],
      );
    }
    const { rows } = await query(
      `SELECT p.slug FROM favorites f JOIN products p ON p.id = f.product_id
       WHERE f.customer_id = $1`,
      [req.customer.id],
    );
    res.json({ slugs: rows.map((row) => row.slug) });
  }),
);

export default router;
