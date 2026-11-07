import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || 'postgres://sonique:sonique@localhost:5432/sonique';

export const pool = new Pool({ connectionString, max: 10 });

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
