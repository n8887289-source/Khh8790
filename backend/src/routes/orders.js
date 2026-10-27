import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { pool, query } from '../db.js';
import { asString, asyncHandler } from '../http.js';
import { MAX_QUANTITY_PER_ITEM, isValidEmail, totalsForSubtotal } from '../pricing.js';

const router = Router();

function makeOrderNumber() {
  const year = new Date().getFullYear();
  return `SON-${year}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function publicOrder(row, items, { includeToken = false } = {}) {
  return {
    number: row.order_number,
    status: row.status,
    name: row.name,
    email: row.email,
    shipping: {
      address1: row.address1,
      address2: row.address2,
      city: row.city,
      postalCode: row.postal_code,
      country: row.country,
    },
    notes: row.notes,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    ...(includeToken ? { lookupToken: row.lookup_token } : {}),
    items: items.map((item) => ({
      slug: item.slug ?? null,
      name: item.name,
      subtitle: item.subtitle,
      image: item.image,
      unitPriceCents: item.unit_price_cents,
      quantity: item.quantity,
    })),
  };
}

/**
 * Creates a demo order. Prices, stock and totals are recomputed here from the catalog -
 * the client's numbers are never trusted. No payment is processed and no card details
 * are collected or stored (see README).
 */
router.post(
  '/orders',
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const name = asString(body.name, { max: 120 });
    const email = asString(body.email, { max: 200 }).toLowerCase();
    const phone = asString(body.phone, { max: 40 });
    const address1 = asString(body.address1, { max: 200 });
    const address2 = asString(body.address2, { max: 200 });
    const city = asString(body.city, { max: 120 });
    const postalCode = asString(body.postalCode, { max: 40 });
    const country = asString(body.country, { max: 120 });
    const notes = asString(body.notes, { max: 500 });

    const missing = [];
    if (!name) missing.push('a name');
    if (!isValidEmail(email)) missing.push('a valid email');
    if (!address1) missing.push('a street address');
    if (!city) missing.push('a city');
    if (!postalCode) missing.push('a postal code');
    if (!country) missing.push('a country');
    if (missing.length > 0) {
      res.status(400).json({ error: `Please provide ${missing.join(', ')}.` });
      return;
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      res.status(400).json({ error: 'Your cart is empty.' });
      return;
    }
    if (rawItems.length > 50) {
      res.status(400).json({ error: 'Too many distinct items in one order.' });
      return;
    }

    const wanted = [];
    for (const item of rawItems) {
      const slug = asString(item?.slug, { max: 120 });
      const quantity = Number(item?.quantity);
      if (!slug || !Number.isInteger(quantity) || quantity < 1) {
        res.status(400).json({ error: 'Each cart line needs a product and a valid quantity.' });
        return;
      }
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        res
          .status(400)
          .json({ error: `You can order up to ${MAX_QUANTITY_PER_ITEM} of a single product.` });
        return;
      }
      wanted.push({ slug, quantity });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: productRows } = await client.query(
        'SELECT * FROM products WHERE slug = ANY($1::text[]) FOR UPDATE',
        [wanted.map((item) => item.slug)],
      );
      const bySlug = new Map(productRows.map((row) => [row.slug, row]));

      const lines = [];
      for (const item of wanted) {
        const product = bySlug.get(item.slug);
        if (!product) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: 'A product in your cart is no longer available.' });
          return;
        }
        if (product.stock < item.quantity) {
          await client.query('ROLLBACK');
          res.status(409).json({ error: `${product.name} only has ${product.stock} in stock.` });
          return;
        }
        lines.push({ product, quantity: item.quantity });
      }

      const subtotalCents = lines.reduce(
        (sum, line) => sum + line.product.price_cents * line.quantity,
        0,
      );
      const totals = totalsForSubtotal(subtotalCents);

      let order = null;
      for (let attempt = 0; attempt < 5 && !order; attempt += 1) {
        try {
          const inserted = await client.query(
            `INSERT INTO orders (
               order_number, lookup_token, name, email, phone, address1, address2, city,
               postal_code, country, notes, subtotal_cents, shipping_cents, total_cents
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
            [
              makeOrderNumber(),
              randomBytes(16).toString('hex'),
              name,
              email,
              phone,
              address1,
              address2,
              city,
              postalCode,
              country,
              notes,
              totals.subtotalCents,
              totals.shippingCents,
              totals.totalCents,
            ],
          );
          order = inserted.rows[0];
        } catch (error) {
          // 23505 = unique violation on the order number: generate another one.
          if (error.code !== '23505' || attempt === 4) throw error;
        }
      }

      const items = [];
      for (const line of lines) {
        const inserted = await client.query(
          `INSERT INTO order_items (
             order_id, product_id, name, subtitle, image, unit_price_cents, quantity
           ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [
            order.id,
            line.product.id,
            line.product.name,
            line.product.subtitle,
            line.product.image,
            line.product.price_cents,
            line.quantity,
          ],
        );
        items.push({ ...inserted.rows[0], slug: line.product.slug });
      }

      await client.query('COMMIT');
      res.status(201).json({ order: publicOrder(order, items, { includeToken: true }) });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }),
);

/**
 * Order lookup for the confirmation page. Order numbers are short and guessable, so the
 * private lookup token created with the order is required as well.
 */
router.get(
  '/orders/:number',
  asyncHandler(async (req, res) => {
    const token = asString(req.query.token, { max: 80 });
    const { rows } = await query('SELECT * FROM orders WHERE order_number = $1', [
      req.params.number,
    ]);
    if (rows.length === 0 || !token || token !== rows[0].lookup_token) {
      res.status(404).json({
        error: 'Order not found. Open the confirmation link from your order to view it again.',
      });
      return;
    }
    const { rows: items } = await query(
      `SELECT oi.*, p.slug FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1 ORDER BY oi.id ASC`,
      [rows[0].id],
    );
    res.json({ order: publicOrder(rows[0], items) });
  }),
);

export default router;
