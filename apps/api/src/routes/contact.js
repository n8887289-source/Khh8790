import { Router } from 'express';
import { query } from '../db.js';
import { isEmail, rateLimit, text } from '../lib/store.js';

export const contactRouter = Router();

/**
 * Stores a message left through the contact page.
 *
 * No mail provider is configured for this store, so nothing is emailed: the
 * message is saved for an operator to read, and the response says exactly that
 * instead of claiming a message was sent.
 */
contactRouter.post('/contact', rateLimit({ max: 10 }), async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const name = text(body.name, 120);
    const email = text(body.email, 254).toLowerCase();
    const topic = text(body.topic, 80) || 'General';
    const message = text(body.message, 2000);

    const fields = {};
    if (name.length < 2) fields.name = 'Please enter your name.';
    if (!isEmail(email)) fields.email = 'Please enter a valid email address.';
    if (message.length < 10) fields.message = 'Please add a little more detail.';

    if (Object.keys(fields).length) {
      return res.status(400).json({ error: 'Please check the highlighted fields.', fields });
    }

    await query(
      'INSERT INTO contact_messages (name, email, topic, message) VALUES ($1, $2, $3, $4)',
      [name, email, topic, message],
    );

    return res.json({
      status: 'stored',
      message:
        'Your message has been saved. Automatic email replies are not configured for this store, so a reply may take longer.',
    });
  } catch (error) {
    return next(error);
  }
});
