import express from 'express';
import { ensureSchema, pool, seedCatalogIfEmpty, waitForDatabase } from './db.js';
import accountRouter, { loadCustomer } from './routes/account.js';
import catalogRouter from './routes/catalog.js';
import newsletterRouter from './routes/newsletter.js';
import ordersRouter from './routes/orders.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

// Session lookup runs for every request; it does nothing without a valid cookie.
app.use(loadCustomer);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'up' });
  } catch {
    res.status(503).json({ ok: false, database: 'down' });
  }
});

app.use('/api', catalogRouter);
app.use('/api', accountRouter);
app.use('/api', ordersRouter);
app.use('/api', newsletterRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'SONIQUE store API',
    note: 'Demonstration store data. No payment provider is configured.',
    endpoints: [
      'GET  /api/health',
      'GET  /api/categories',
      'GET  /api/products?q=&category=&sort=&minPrice=&maxPrice=&minRating=&inStock=&tab=&limit=',
      'GET  /api/products/:slug',
      'POST /api/newsletter',
      'POST /api/auth/register | /api/auth/login | /api/auth/logout',
      'GET  /api/auth/me',
      'GET|POST|DELETE /api/favorites',
      'POST /api/orders',
      'GET  /api/orders/:number?token=',
    ],
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  console.error('[api] unhandled error:', error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

try {
  await waitForDatabase();
  await ensureSchema();
  const seeded = await seedCatalogIfEmpty();
  if (seeded) console.log('[api] catalog was empty - seeded the demo catalog');
  app.listen(port, '0.0.0.0', () => {
    console.log(`[api] listening on http://0.0.0.0:${port}`);
  });
} catch (error) {
  console.error('[api] failed to start:', error);
  process.exit(1);
}
