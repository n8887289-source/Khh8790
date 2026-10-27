import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const here = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[migrate] schema is up to date');
  await pool.end();
}

main().catch(async (error) => {
  console.error('[migrate] failed:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
