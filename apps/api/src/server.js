import express from 'express';
import { pool } from './db.js';
import { contactRouter } from './routes/contact.js';
import { adminRouter } from './routes/admin.js';
import { newsletterRouter } from './routes/newsletter.js';
import { ordersRouter } from './routes/orders.js';
import { productsRouter } from './routes/products.js';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '8000', 10);

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch (error) {
    res.status(503).json({ status: 'degraded', database: 'down', error: error.message });
  }
});

app.use('/api', productsRouter);
app.use('/api', ordersRouter);
app.use('/api', newsletterRouter);
app.use('/api', contactRouter);
app.use('/api', adminRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API endpoint' });
});

// eslint-disable-next-line no-unused-vars -- Express needs the 4-argument shape.
app.use((error, _req, res, _next) => {
  console.error('[api] request failed:', error);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[api] SONIQUE store API listening on http://0.0.0.0:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => pool.end().then(() => process.exit(0)));
  });
}
