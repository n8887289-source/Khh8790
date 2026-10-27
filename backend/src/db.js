import pg from 'pg';
import { categories as seedCategories, products as seedProducts } from './seed-data.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set - using the local compose default.');
}

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://sonique:sonique_dev_password@db:5432/sonique',
  max: 10,
});

export function query(text, params) {
  return pool.query(text, params);
}

/** Waits for Postgres to accept connections (compose healthchecks can still race a cold start). */
export async function waitForDatabase(attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      slug        text PRIMARY KEY,
      name        text NOT NULL,
      tagline     text NOT NULL DEFAULT '',
      blurb       text NOT NULL DEFAULT '',
      image       text NOT NULL DEFAULT '',
      sort_order  integer NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id             serial PRIMARY KEY,
      slug           text UNIQUE NOT NULL,
      name           text NOT NULL,
      category_slug  text NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
      subtitle       text NOT NULL DEFAULT '',
      description    text NOT NULL DEFAULT '',
      price_cents    integer NOT NULL CHECK (price_cents >= 0),
      badge          text,
      rating         numeric(2,1) NOT NULL DEFAULT 0,
      review_count   integer NOT NULL DEFAULT 0,
      stock          integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image          text NOT NULL DEFAULT '',
      images         jsonb NOT NULL DEFAULT '[]'::jsonb,
      colors         jsonb NOT NULL DEFAULT '[]'::jsonb,
      specs          jsonb NOT NULL DEFAULT '[]'::jsonb,
      is_bestseller  boolean NOT NULL DEFAULT false,
      is_new         boolean NOT NULL DEFAULT false,
      is_premium     boolean NOT NULL DEFAULT false,
      released_at    timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_slug);

    CREATE TABLE IF NOT EXISTS customers (
      id             serial PRIMARY KEY,
      email          text UNIQUE NOT NULL,
      name           text NOT NULL DEFAULT '',
      password_hash  text NOT NULL,
      created_at     timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS favorites (
      customer_id  integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_id   integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at   timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (customer_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id          serial PRIMARY KEY,
      email       text UNIQUE NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id              serial PRIMARY KEY,
      order_number    text UNIQUE NOT NULL,
      lookup_token    text NOT NULL,
      customer_id     integer REFERENCES customers(id) ON DELETE SET NULL,
      name            text NOT NULL,
      email           text NOT NULL,
      phone           text NOT NULL DEFAULT '',
      address1        text NOT NULL,
      address2        text NOT NULL DEFAULT '',
      city            text NOT NULL,
      postal_code     text NOT NULL,
      country         text NOT NULL,
      notes           text NOT NULL DEFAULT '',
      subtotal_cents  integer NOT NULL,
      shipping_cents  integer NOT NULL,
      total_cents     integer NOT NULL,
      status          text NOT NULL DEFAULT 'demo-awaiting-payment',
      created_at      timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id                serial PRIMARY KEY,
      order_id          integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id        integer REFERENCES products(id) ON DELETE SET NULL,
      name              text NOT NULL,
      subtitle          text NOT NULL DEFAULT '',
      image             text NOT NULL DEFAULT '',
      unit_price_cents  integer NOT NULL CHECK (unit_price_cents >= 0),
      quantity          integer NOT NULL CHECK (quantity > 0)
    );

    CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

    -- Keeps databases created by an earlier revision of this schema usable.
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS lookup_token text NOT NULL DEFAULT '';
  `);
}

export async function countProducts() {
  const { rows } = await pool.query('SELECT count(*)::int AS count FROM products');
  return rows[0].count;
}

/**
 * Upserts the demonstration catalog and categories. Safe to run repeatedly: the seed
 * data is the source of truth for the demo store's content.
 */
export async function seedCatalog() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const category of seedCategories) {
      await client.query(
        `INSERT INTO categories (slug, name, tagline, blurb, image, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           tagline = EXCLUDED.tagline,
           blurb = EXCLUDED.blurb,
           image = EXCLUDED.image,
           sort_order = EXCLUDED.sort_order`,
        [
          category.slug,
          category.name,
          category.tagline,
          category.blurb,
          category.image,
          category.sortOrder,
        ],
      );
    }

    for (const product of seedProducts) {
      await client.query(
        `INSERT INTO products (
           slug, name, category_slug, subtitle, description, price_cents, badge, rating,
           review_count, stock, image, images, colors, specs, is_bestseller, is_new,
           is_premium, released_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12::jsonb, $13::jsonb, $14::jsonb, $15, $16,
           $17, $18
         )
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           category_slug = EXCLUDED.category_slug,
           subtitle = EXCLUDED.subtitle,
           description = EXCLUDED.description,
           price_cents = EXCLUDED.price_cents,
           badge = EXCLUDED.badge,
           rating = EXCLUDED.rating,
           review_count = EXCLUDED.review_count,
           stock = EXCLUDED.stock,
           image = EXCLUDED.image,
           images = EXCLUDED.images,
           colors = EXCLUDED.colors,
           specs = EXCLUDED.specs,
           is_bestseller = EXCLUDED.is_bestseller,
           is_new = EXCLUDED.is_new,
           is_premium = EXCLUDED.is_premium,
           released_at = EXCLUDED.released_at`,
        [
          product.slug,
          product.name,
          product.category,
          product.subtitle,
          product.description,
          product.priceCents,
          product.badge,
          product.rating,
          product.reviewCount,
          product.stock,
          product.image,
          JSON.stringify(product.images),
          JSON.stringify(product.colors),
          JSON.stringify(product.specs),
          product.flags.bestseller,
          product.flags.isNew,
          product.flags.premium,
          product.releasedAt,
        ],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function seedCatalogIfEmpty() {
  if ((await countProducts()) === 0) {
    await seedCatalog();
    return true;
  }
  return false;
}
