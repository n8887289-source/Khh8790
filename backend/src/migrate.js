/**
 * One-shot schema + catalog seed. Run by the `migrate` compose service before the API
 * starts (the API also self-heals an empty catalog on boot).
 */
import { ensureSchema, pool, seedCatalog, waitForDatabase } from './db.js';

try {
  await waitForDatabase();
  await ensureSchema();
  await seedCatalog();
  const { rows } = await pool.query('SELECT count(*)::int AS count FROM products');
  console.log(`[migrate] schema ready, ${rows[0].count} demo products available`);
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('[migrate] failed:', error);
  await pool.end().catch(() => {});
  process.exit(1);
}
