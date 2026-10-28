# AGENTS.md — SONIQUE storefront

Notes for anyone (human or agent) working in this repository in the Base44 sandbox.
Only the non-obvious things are here; package manifests and the compose file speak for themselves.

## What this app is

A two-service fullstack e-commerce storefront:

| Service  | Stack                            | Where               |
| -------- | -------------------------------- | ------------------- |
| `web`    | Vite + React 18 + TypeScript + Tailwind CSS v4 | `apps/web` |
| `api`    | Node 22 + Express 4 + `pg`       | `apps/api`          |
| `db`     | PostgreSQL 16                    | compose service     |

The browser only ever talks to **one origin**: the Vite dev server on host port 3000 proxies
`/api/*` to the API service. That is deliberate — no CORS, and same-origin cookies/sessions stay
possible if authentication is added later. Do not publish the API port publicly.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps          # all services should be healthy
curl localhost:3000/api/health                          # {"status":"ok","database":"up"}
```

Startup order matters: `db` (healthy) → `db-setup` (one-shot, runs `db/migrate.js` then
`db/seed.js`, then exits 0) → `api` → `web`. Application services install dependencies from the
lockfile on start and run the framework's watch command, so edits appear without a rebuild.

- Frontend edits: hot-reloaded by Vite.
- Backend edits: restarted by `node --watch`.
- Schema or seed changes: re-run the one-shot setup service —
  `docker compose -f docker-compose.base44.yml run --rm db-setup`
  (it is idempotent: migrations use `IF NOT EXISTS`, seeds upsert by slug).

`DATABASE_URL` points at the local compose database. One secret is used: `SESSION_SECRET` (at least
16 characters) signs the administrator session cookie for `/admin`. The platform-managed
`/run/base44/app.env` is wired into the API as the last `env_file` entry, and a development
placeholder for `SESSION_SECRET` is generated so the store boots; replace it with your own random
value if you deploy this somewhere real. Without it the admin API answers 503 and the storefront is
unaffected.

## Store admin (`/admin`)

- First visit to `/admin` on an empty `admin_users` table shows a one-time "create the administrator
  account" form. That account then owns the catalogue, orders and newsletter list; the setup
  endpoint refuses once an account exists. Everyone else only ever sees the sign-in form.
- Sign-in sets an HttpOnly, SameSite=Strict cookie (`sonique_admin`) holding an HMAC-signed token
  with a 12-hour expiry. Passwords are stored as scrypt hashes in `admin_users`.
- Every `/api/admin/*` route except `session`, `setup`, `login` and `logout` goes through
  `requireAdmin` in `apps/api/src/lib/adminAuth.js`. Moving or hiding UI never weakens it — keep it
  that way; do not add an admin route outside that guard.
- Admin API: product CRUD (`GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`),
  orders plus status changes (`GET /api/admin/orders`, `PATCH /api/admin/orders/:orderNumber`),
  `GET /api/admin/subscribers`, `GET /api/admin/messages`.
- Order status is visible to customers on `/order/:orderNumber`; allowed values are
  `demo_unpaid`, `processing`, `shipped`, `delivered`, `cancelled`.
- To reset admin access (forgotten password), delete the row — the next visit offers setup again:
  `docker compose -f docker-compose.base44.yml exec -T db psql -U sonique -d sonique -c "DELETE FROM admin_users;"`

## Sandbox-specific configuration

- `BASE44_PREVIEW_MODE` is passed through to both app services. When it equals `"1"` **and**
  `BASE44_SANDBOX_HOST_DOMAIN` is set, `apps/web/vite.config.ts` allows exactly that one host
  wildcard (`.$BASE44_SANDBOX_HOST_DOMAIN`) — the preview proxy reaches the dev server as
  `<port>-<sandbox id>.<sandbox host domain>`, and the sandbox id changes on every re-import.
  With the flag unset or any other value the allowlist stays empty and Vite keeps its default
  localhost-only behaviour. `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is also passed through.
- Vite file watching uses polling (`server.watch.usePolling`), because bind mounts on some hosts
  do not deliver native filesystem events.
- Never hardcode a resolved `BASE44_*` value into a file; reference the variable.

## Images

All photography is committed under `apps/web/public/images/` (products, categories, editorial) and
served locally — the app never depends on a remote image host at runtime. Sources are free-to-use
Unsplash photographs, chosen for dark backgrounds so product cards sit on the black canvas.

If you add or rename an asset, update `apps/api/db/seed.js` and re-run the setup service: product
`images` arrays live in the database, seeded from that file. Product cards and the cart use
`images[0]`; the product page gallery uses the whole array.

## Data model and honest boundaries

- `products`, `categories` — the demo catalogue (16 products, 5 categories).
- `orders`, `order_items` — checkout writes here. `status` is always `demo_unpaid`: there is **no
  payment provider configured**, so nothing is charged and no card details are ever requested or
  stored. Do not claim a payment was processed.
- `newsletter_subscribers`, `contact_messages` — real writes. No email provider is connected, so
  sign-ups are stored rather than emailed, and the UI says so.

Order totals are always recalculated server-side from catalogue prices (`quoteCart`); the client
cannot influence what an order costs. Order lookup requires the order number **and** the matching
email address.

Cart and favourites are client-side only (`localStorage`): there is no customer sign-in, only the
single administrator account described above, and the UI states this instead of pretending
otherwise.

Ratings, review counts and testimonials are **sample demonstration content**, labelled as such in
the UI. Keep that labelling when editing copy.

## Verification

There is no test suite. Verify against the running stack:

```bash
curl localhost:3000/api/health
curl "localhost:3000/api/products?category=headphones&sort=price-asc"     # search/filter/sort
curl "localhost:3000/api/products?search=pulse"
```

Then exercise the UI in the preview. Useful checks after a change: home sections and product grid
render, category/collection filters change the result count, add-to-cart updates the header badge,
cart totals equal `subtotal + shipping` (free at $99+, otherwise $9.95), and no element causes
horizontal overflow at 320–1440px.

Note when testing writes: creating an order, a newsletter sign-up, a contact message, a product or an
admin account leaves a real row behind — remove it afterwards by the exact key the test created.
Admin checks: `curl -s localhost:3000/api/admin/session` reports `configured`/`hasAccount`, and
`curl -o /dev/null -w '%{http_code}' localhost:3000/api/admin/products` must answer 401 without a
session cookie.
