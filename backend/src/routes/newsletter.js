import { Router } from 'express';
import { query } from '../db.js';
import { asString, asyncHandler } from '../http.js';
import { isValidEmail } from '../pricing.js';

const router = Router();

/**
 * Stores a newsletter subscriber. The demo store writes to its own Postgres service,
 * so subscriptions really are persisted (and the UI says exactly that).
 */
router.post(
  '/newsletter',
  asyncHandler(async (req, res) => {
    const email = asString(req.body?.email, { max: 200 }).toLowerCase();
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const inserted = await query(
      `INSERT INTO subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [email],
    );
    res.status(inserted.rowCount > 0 ? 201 : 200).json({
      ok: true,
      alreadySubscribed: inserted.rowCount === 0,
      message:
        inserted.rowCount > 0
          ? `Thanks - ${email} is on the list.`
          : `${email} is already on the list.`,
    });
  }),
);

export default router;
