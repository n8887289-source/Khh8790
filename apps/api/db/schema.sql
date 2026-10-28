-- SONIQUE store schema.
-- Every statement is idempotent so the migrate step can run on every boot.

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  category_slug    TEXT NOT NULL REFERENCES categories (slug) ON UPDATE CASCADE,
  tagline          TEXT NOT NULL DEFAULT '',   -- short line shown under the product name
  description      TEXT NOT NULL DEFAULT '',
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2),
  badge            TEXT,
  rating           NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count     INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  in_stock         BOOLEAN NOT NULL DEFAULT TRUE,
  colors           TEXT[] NOT NULL DEFAULT '{}',
  specs            JSONB NOT NULL DEFAULT '[]'::jsonb,
  images           TEXT[] NOT NULL DEFAULT '{}',
  tabs             TEXT[] NOT NULL DEFAULT '{}',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applies columns to a database created by an earlier revision of this file.
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tabs TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_slug);
CREATE INDEX IF NOT EXISTS products_tabs_idx ON products USING GIN (tabs);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_number   TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  address_line1  TEXT NOT NULL DEFAULT '',
  address_line2  TEXT NOT NULL DEFAULT '',
  city           TEXT NOT NULL DEFAULT '',
  postcode       TEXT NOT NULL DEFAULT '',
  country        TEXT NOT NULL DEFAULT '',
  notes          TEXT NOT NULL DEFAULT '',
  subtotal       NUMERIC(10, 2) NOT NULL,
  shipping       NUMERIC(10, 2) NOT NULL,
  total          NUMERIC(10, 2) NOT NULL,
  -- This store has no payment provider configured, so orders are recorded as
  -- unpaid demo orders. No card data is ever requested or stored.
  status         TEXT NOT NULL DEFAULT 'demo_unpaid',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (lower(customer_email));

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products (id) ON DELETE SET NULL,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  unit_price  NUMERIC(10, 2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Store administrators. Passwords are stored as scrypt hashes; the browser only
-- ever holds a signed, HttpOnly session cookie.
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages left through the contact page. This store has no mail provider
-- configured, so messages are stored here for an operator to read rather than
-- being emailed on submit.
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  topic      TEXT NOT NULL DEFAULT 'General',
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
