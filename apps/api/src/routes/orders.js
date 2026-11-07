import { Router } from 'express';
import { query } from '../db.js';
import { isEmail, quantity, rateLimit, text } from '../lib/store.js';
import { quoteCart } from './products.js';

export const ordersRouter = Router();

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0');
  return `SQ-${stamp}${random}`;
}

function mapOrder(row) {
  return {
    orderNumber: row.order_number,
    name: row.customer_name,
    email: row.customer_email,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    placedAt: row.created_at,
  };
}

/**
 * Places a demo order.
 *
 * Prices and totals are recalculated here from the catalogue, so a tampered
 * client cannot change what an order costs. No payment is taken or claimed:
 * every order is stored as `demo_unpaid` because this store has no payment
 * provider configured, and no card details are ever requested or stored.
 */
ordersRouter.post('/orders', rateLimit({ max: 10 }), async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const customer = body.customer ?? {};

    const name = text(customer.name, 120);
    const email = text(customer.email, 254).toLowerCase();
    const phone = text(customer.phone, 40);
    const addressLine1 = text(customer.addressLine1, 160);
    const addressLine2 = text(customer.addressLine2, 160);
    const city = text(customer.city, 80);
    const postcode = text(customer.postcode, 24);
    const country = text(customer.country, 80);
    const notes = text(customer.notes, 500);

    const problems = {};
    if (name.length < 2) problems.name = 'Please enter your full name.';
    if (!isEmail(email)) problems.email = 'Please enter a valid email address.';
    if (addressLine1.length < 4) problems.addressLine1 = 'Please enter your street address.';
    if (city.length < 2) problems.city = 'Please enter your city.';
    if (postcode.length < 2) problems.postcode = 'Please enter your postcode.';
    if (country.length < 2) problems.country = 'Please enter your country.';

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) problems.items = 'Your cart is empty.';

    if (Object.keys(problems).length) {
      return res.status(400).json({ error: 'Please check the highlighted fields.', fields: problems });
    }

    const { lines, subtotal, shipping, total } = await quoteCart(items);
    if (!lines.length) {
      return res.status(400).json({ error: 'None of the items in your cart are available.' });
    }

    const unavailable = lines.filter((line) => !line.inStock).map((line) => line.name);
    if (unavailable.length) {
      return res.status(409).json({
        error: `Out of stock: ${unavailable.join(', ')}. Please remove ${
          unavailable.length > 1 ? 'them' : 'it'
        } to continue.`,
      });
    }

    for (const line of lines) {
      if (!quantity(line.quantity)) {
        return res.status(400).json({ error: `Invalid quantity for ${line.name}.` });
      }
    }

    const inserted = await query(
      `INSERT INTO orders (
         order_number, customer_name, customer_email, customer_phone, address_line1, address_line2,
         city, postcode, country, notes, subtotal, shipping, total, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'demo_unpaid')
       RETURNING *`,
      [
        orderNumber(),
        name,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        postcode,
        country,
        notes,
        subtotal,
        shipping,
        total,
      ],
    );

    const order = inserted.rows[0];

    for (const line of lines) {
      await query(
        `INSERT INTO order_items (order_id, product_id, slug, name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, line.id, line.slug, line.name, line.unitPrice, line.quantity, line.lineTotal],
      );
    }

    return res.status(201).json({
      order: mapOrder(order),
      items: lines,
      payment: {
        processed: false,
        message:
          'No payment provider is configured for this store, so this is a demo order. Nothing was charged.',
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Order lookup for the account page. Both the order number and the matching
 * email address are required, so an order cannot be read by guessing a number.
 */
ordersRouter.get('/orders/:orderNumber', rateLimit({ max: 30 }), async (req, res, next) => {
  try {
    const email = text(req.query.email, 254).toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Enter the email address used for the order.' });
    }

    const { rows } = await query(
      `SELECT * FROM orders WHERE order_number = $1 AND lower(customer_email) = $2`,
      [text(req.params.orderNumber, 40).toUpperCase(), email],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'No order found with that number and email address.' });
    }

    const items = await query(
      `SELECT slug, name, unit_price, quantity, line_total FROM order_items WHERE order_id = $1`,
      [rows[0].id],
    );

    return res.json({
      order: mapOrder(rows[0]),
      items: items.rows.map((item) => ({
        slug: item.slug,
        name: item.name,
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
      })),
    });
  } catch (error) {
    return next(error);
  }
});
