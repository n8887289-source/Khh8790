# SONIQUE — premium audio storefront

A cinematic, dark storefront for a fictional premium audio brand (headphones, earbuds,
speakers, amplifiers, accessories), built as a real full-stack application: React storefront
+ REST API + PostgreSQL.

> **Demonstration store.** Products, prices, ratings, review counts and testimonials are
> invented sample content for a demo build — not real-world products, not verified customer
> reviews. Checkout records an order and shows a confirmation, but **no payment is processed
> and no card details are collected**.

## Stack

| Part | Technology |
| --- | --- |
| Storefront | React 18, Vite 6, TypeScript, Tailwind CSS 3, React Router 6, lucide-react |
| API | Node 22, Express 4, `pg` (ESM, `node --watch` in development) |
| Database | PostgreSQL 16 |
| Local runtime | Docker Compose (`docker-compose.base44.yml`) |

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d          # first run: add --build
docker compose -f docker-compose.base44.yml ps             # everything should be healthy
```

Services (all run from the cloned source with live reload, never from a prebuilt image):

| Service | Host port | Purpose |
| --- | --- | --- |
| `web` | 3000 | Vite dev server — the storefront entry point |
| `api` | 4000 | Express API (`GET /` lists the endpoints, `/api/health` for probes) |
| `db` | – | PostgreSQL 16 (volume `db_data`) |
| `migrate` | – | One-shot schema + catalog seed; exits before the API starts |

The browser only ever talks to port 3000: the Vite dev server proxies `/api` to the API
service, so sessions are same-origin and no CORS exception is needed.

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `DATABASE_URL` | compose `environment:` | Local infrastructure credential, set inline in the compose file |
| `PORT` | compose `environment:` | API port (4000) |
| `SESSION_SECRET` | `.env.base44-defaults`, then `/run/base44/app.env` | Signs the session cookie. The committed value is a local development placeholder; a real environment should provide its own. Listed **last** in `env_file:` so a platform-provided value always wins |
| `API_PROXY_TARGET` | compose `environment:` | Vite proxy target (`http://api:4000`) |
| `BASE44_PREVIEW_MODE`, `BASE44_SANDBOX_HOST_DOMAIN`, `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` | passed through from the platform | See "Base44 sandbox notes" |

## Store rules

* Shipping: **free** on orders of $99.00 and above, otherwise a flat **$12.00**.
* The customer can order at most 10 units of a single product per order.
* The rule lives in `backend/src/pricing.js` (the server always recomputes totals) and is
  mirrored in `frontend/src/lib/format.ts` for instant cart feedback.

## API

```
GET    /api/health
GET    /api/categories
GET    /api/products?q=&category=&sort=&minPrice=&maxPrice=&minRating=&inStock=&tab=&limit=
GET    /api/products/:slug                  # includes related products
POST   /api/newsletter                      # { email }
POST   /api/auth/register | login | logout
GET    /api/auth/me
GET    /api/favorites                       # signed in
POST   /api/favorites                       # { slug }
DELETE /api/favorites/:slug
POST   /api/favorites/sync                  # { slugs } — merges guest favourites on sign-in
POST   /api/orders                          # server-validates stock and prices
GET    /api/orders/:number?token=           # order lookup needs number + lookup token
```

Sorting values: `featured`, `price-asc`, `price-desc`, `rating`, `newest`.
Tabs: `bestsellers`, `new`, `premium`.

## Behaviour worth knowing

* **Cart and saved items** live in the browser (`localStorage`) and work without an account.
  Signing in copies saved items to the account (`favorites` table) so they follow the user.
* **Accounts** use email + password. Passwords are stored as salted scrypt hashes; the session
  is a signed, HttpOnly cookie. No social sign-in is configured.
* **Orders** never trust client totals: prices, stock and totals are recomputed server-side in
  a transaction, and stock is re-checked. Order lookup requires the unguessable lookup token
  created with the order, so one demo shopper cannot read another's address.
* **Gift cards and affiliate tracking** are not implemented; those pages say so plainly rather
  than pretending to work.
* There is **no admin API** — the catalog is written only by the seed in `backend/src/seed-data.js`.

## Verification

```bash
# type check the storefront
docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit

# API smoke checks
curl -s http://localhost:3000/api/health
curl -s "http://localhost:3000/api/products?category=speakers&sort=price-asc"
```

There is no automated test suite in this repository yet. Changes are currently verified with
the type check, the API smoke checks above, and by driving the running app.

## Project layout

```
backend/src/           server.js, db.js (schema + seed), auth.js, pricing.js, routes/
frontend/src/
  components/          header, cart drawer, search overlay, account panel, product card, ui
  sections/            home page sections (hero, categories, featured, story, promo, newsletter)
  pages/               home, shop, product, cart, checkout, order, favourites, account, info
  content/infoPages.ts editorial, support and legal copy behind every footer link
  lib/                 api client, formatters, hooks
  store/StoreContext.tsx  cart, saved items, account, toasts, overlays
```

## Base44 sandbox notes

`frontend/vite.config.ts` reads `BASE44_PREVIEW_MODE`. Only when it is exactly `"1"` does the
dev server add the sandbox host wildcard (`.${BASE44_SANDBOX_HOST_DOMAIN}`) to
`server.allowedHosts`; with the variable unset or any other value the config behaves as a plain
Vite setup (Vite's default allowlist). The public preview host is handled by the platform's
`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, which is simply passed through from the environment.
No authentication, CSRF or TLS behaviour is relaxed by that flag.
