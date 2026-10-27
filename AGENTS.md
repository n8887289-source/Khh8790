# AGENTS.md — working notes for this repository

Non-obvious things a future session should know. See `README.md` for the product overview.

## Running and checking

* Everything runs through `docker-compose.base44.yml` (`up -d`). `web` (host 3000) is the only
  public entry point; it proxies `/api` to `api` (host 4000). `db` is Postgres 16.
* Application services run **from the bind-mounted source** with live reload
  (`vite`, `node --watch`). There is no prebuilt app image, so edits appear without a rebuild.
* The host has no Node/Postgres installed — run every command inside a container, e.g.
  `docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit`.
* `npm ci` runs at container start for both `backend` and `frontend` against named volumes
  (`api_node_modules`, `web_node_modules`). **After changing a `package.json`, regenerate the
  lockfile or the next start fails:**
  ```bash
  docker run --rm -v /app/backend:/app  -w /app node:22 npm install --no-audit --no-fund --package-lock-only
  docker run --rm -v /app/frontend:/app -w /app node:22 npm install --no-audit --no-fund --package-lock-only
  docker compose -f docker-compose.base44.yml up -d --force-recreate web   # reinstalls from the lockfile
  ```
  Compose is the only supported way; do not `npm install` on the host.
* There is **no test suite** yet. Verification today = `tsc --noEmit`, the API smoke checks in
  the README, and driving the running app in the preview. If you add tests, put them in the
  package that owns the code and run them inside that service's container.

## Data and migrations

* `backend/src/db.js` owns the schema (`ensureSchema`) and the demo catalog (`seedCatalog`,
  an idempotent upsert from `seed-data.js`).
* The `migrate` service seeds before the API starts, and the API additionally runs
  `ensureSchema` + `seedCatalogIfEmpty` on boot — so a wiped volume heals itself. New columns
  must therefore be added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` as well as in
  `CREATE TABLE` (see `orders.lookup_token`) to keep older volumes usable.
* Money is stored in integer cents. Never trust client-sent prices or totals: `POST /api/orders`
  reloads products inside a transaction, re-checks stock and recomputes the total.
* Order lookup (`GET /api/orders/:number`) deliberately requires the order's `lookup_token`,
  because order numbers are short and guessable. Keep it that way.

## Frontend conventions

* Shipping rule is duplicated on purpose: `backend/src/pricing.js` is authoritative, and
  `frontend/src/lib/format.ts` mirrors the same constants for instant cart feedback. Change both.
* Cart and saved items are `localStorage`-first (`sonique.cart.v1`, `sonique.favorites.v1`);
  the server only stores favourites for signed-in customers, merged on sign-in.
* All overlays (cart drawer, search, account panel, film panel, filter sheet) use the shared
  `useBodyLock` / `useEscapeKey` hooks and render inside `App.tsx` after `<Footer />`, so their
  form controls come **after** the home page newsletter form in DOM order. When targeting a
  submit button in an automated check, use its accessible name, not a bare `form button[type=submit]`.
* Product imagery is local (`frontend/public/img/*.jpg`) so it always loads. The design language
  is dark and cinematic, so check any new photo's brightness before adding it — a bright/white
  studio shot breaks the look:
  ```bash
  docker run --rm -v /app/frontend/public/img:/img:ro -v /tmp:/work -w /work node:22 \
    sh -c "npm install --no-save jpeg-js >/dev/null 2>&1 && node -e \"const j=require('jpeg-js'),f=require('fs');for(const n of f.readdirSync('/img')){const d=j.decode(f.readFileSync('/img/'+n),{useTArray:true}).data;let s=0;for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];console.log((s/(d.length/4)).toFixed(1),n)}\""
  ```
  Aim for a mean luminance under ~120 with almost no pixels above 200.
* `frontend/src/content/infoPages.ts` is the single source for editorial/support/legal pages;
  each key becomes a route (`/our-story`, `/faq`, `/track-order`, …) in `App.tsx`. Adding a page
  there is enough — no new component needed.

## Base44 sandbox specifics

* `frontend/vite.config.ts` gates the sandbox host allowlist on
  `BASE44_PREVIEW_MODE === '1'` and appends `.${BASE44_SANDBOX_HOST_DOMAIN}`; unset, it is a
  plain Vite config. The public preview host arrives through
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (passed straight through from the environment).
* Never hardcode a resolved `BASE44_*` value in a file — reference the variable.
* Real credentials belong to the user: put secrets in the platform-managed
  `/run/base44/app.env` (listed last in `env_file:`) and keep only placeholders in the committed
  `.env.base44-defaults`.
