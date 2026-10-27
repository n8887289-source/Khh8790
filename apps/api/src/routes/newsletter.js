import { Router } from 'express';
import { query } from '../db.js';
import { isEmail, rateLimit, text } from '../lib/store.js';

export const newsletterRouter = Router();

/**
 * Stores a newsletter subscriber. The email is validated here on the server and
 * the table's unique constraint makes repeat sign-ups idempotent.
 */
newsletterRouter.post('/newsletter', rateLimit({ max: 10 }), async (req, res, next) => {
  try {
    const email = text(req.body?.email, 254).toLowerCase();

    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const inserted = await query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING email`,
      [email],
    );

    return res.json({
      status: inserted.rowCount ? 'subscribed' : 'already_subscribed',
      message: inserted.rowCount
        ? 'You are on the list. Welcome to a louder tomorrow.'
        : 'That email address is already subscribed.',
    });
  } catch (error) {
    return next(error);
  }
});
