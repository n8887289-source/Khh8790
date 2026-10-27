# SONIQUE — premium audio storefront

A full-stack e-commerce storefront for a fictional premium audio brand. Deep-black canvas, midnight
navy surfaces, electric blue and violet lighting, dense product grids and thin hairline dividers.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Then open **http://localhost:3000**. The first boot also creates the database schema and seeds the
demo catalogue; all four services should report healthy from `docker compose ps`.

| Service | Port (host) | What it is |
| ------- | ----------- | ---------- |
| web     | 3000        | Vite + React storefront (the only public entry point) |
| api     | internal    | Express API for the catalogue, orders, newsletter and contact |
| db      | internal    | PostgreSQL 16 |
| db-setup| one-shot    | Applies the schema and refreshes the demo catalogue, then exits |

## What is built

- **Home** — announcement bar, sticky navigation with a shop menu, cinematic hero with the promo
  film modal, shop-by-category grid, featured products with Best Sellers / New Arrivals / Premium
  tabs, editorial brand story, speaker promotion, testimonials and newsletter.
- **Catalogue** — search by name, category or description, plus category, price, rating,
  availability and collection filters with sorting, a clear-all control and an empty-results state.
- **Product pages** — image gallery with thumbnails, colour selection, validated quantity stepper,
  add to cart, favourites, specifications, shipping information and related products.
- **Cart and checkout** — persisted cart, quantity editing, subtotal/shipping/total, a demo checkout
  that collects only delivery details, and an order confirmation with a private order lookup.
- **Account** — order lookup by order number + email, plus what is stored on this device.
- **Editorial, support and legal pages** — story, sustainability, press, careers, affiliates, gift
  cards, tracking, returns, warranty, product help, contact form, FAQs, privacy, terms, cookies.

Accessibility: semantic landmarks, labelled controls, a skip link, keyboard-operable menus and
modals with focus management, visible focus rings, descriptive alt text, lazy-loaded imagery, and
reduced-motion support.

## Honest boundaries

This is a demonstration store. Please read these before treating anything as production-ready:

- **No payment provider is configured.** Checkout records the order as `demo_unpaid`; nothing is
  charged, no card details are collected, and the confirmation page says so. Connecting a provider
  is a separate configuration step.
- **No email provider is configured.** Newsletter sign-ups and contact messages are stored in the
  database rather than sent anywhere; the UI says that instead of claiming otherwise.
- **No authentication.** There is no sign-in. Cart and favourites live in this browser's local
  storage; orders are retrieved with an order number plus the email they were placed with.
- **Sample content.** Products, prices, ratings, review counts and testimonials are demonstration
  content created for this build, not real reviews of real products.

## Layout

```
apps/web    Vite + React + TypeScript + Tailwind CSS v4 storefront
  src/components/ui        design-system pieces (Button, Modal, Reveal, StarRating, …)
  src/components/layout    header, footer, search overlay, cart drawer, shop menu
  src/components/home      home page sections
  src/pages                one file per route
  src/context              cart, favourites and toast state
  public/images            committed photography (products, categories, editorial)
apps/api    Express + Postgres API
  src/routes               products, orders, newsletter, contact
  src/lib/store.js         validation, shipping rule and row mapping
  db/schema.sql            idempotent schema
  db/seed.js               demo catalogue (upserts by slug)
```

Store rules: shipping is free on orders of $99 or more, otherwise a flat $9.95. Totals are always
recalculated on the server from catalogue prices.

See `AGENTS.md` for sandbox-specific setup notes and verification steps.
