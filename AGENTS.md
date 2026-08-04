# AGENTS.md

MorphIndex — Next.js 15 (App Router) facial-analysis SaaS. Funnel: landing →
inscription → onboarding (5 écrans) → photo → analyse Claude → rapport flouté →
paiement Stripe → rapport complet. See `README.md` and `docs/BACKEND.md`.

## Cursor Cloud specific instructions

### Services

- **Next.js dev server** — the whole product (frontend + `/api/*` route handlers).
  Run with `npm run dev` (port 3000). Standard scripts live in `package.json`
  (`dev`, `build`, `start`, `lint`, `test`).
- **Supabase** — required backend (Auth + Postgres + Storage). The repo's
  documented flow targets a *hosted* Supabase project, but a **local** stack works
  too (see below) and needs no external secrets.

### Running the app end-to-end locally (no external secrets)

The app cannot do anything meaningful without Supabase. To run fully offline:

1. Start Docker (the cloud VM has no systemd): `sudo dockerd &` then
   `sudo chmod 666 /var/run/docker.sock`. Docker 29 needs the fuse-overlayfs
   storage driver with `containerd-snapshotter` disabled (`/etc/docker/daemon.json`).
2. `supabase start` (Supabase CLI). This boots the local stack, auto-applies
   `supabase/migrations/0001…0006`, runs `supabase/seed.sql`, and creates the
   private `photos` bucket (migration `0002`).
3. Put the local credentials from `supabase status` into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, plus the anon and
   service-role keys. `.env.local` is gitignored.
4. `npm run dev`, then verify wiring with `GET /api/health/` → `{"ok":true}`.

Note: Docker + the Supabase CLI are system tooling, not npm deps, so they are
**not** in the startup update script — install them once per fresh VM (or provide
hosted Supabase secrets and skip Docker entirely).

### Non-obvious gotchas

- **service_role 403 / `/api/health` 503 after a fresh `supabase start`.** The
  local `supabase/postgres` image grants only a partial privilege set to the API
  roles, unlike hosted Supabase which grants full CRUD on new `public` tables.
  `supabase/seed.sql` re-grants CRUD to `anon`/`authenticated`/`service_role` and
  is re-run automatically on every `supabase start` / `supabase db reset`. If you
  ever see `permission denied for table ...`, re-run it and
  `notify pgrst, 'reload schema';` (PostgREST caches privileges).
- **Fake analysis flag.** Set `MORPHINDEX_FAKE_ANALYSIS=1` in `.env.local` to skip
  the Anthropic API — `runAnalysis` returns canned data after ~2s. It is *forbidden*
  when `NODE_ENV=production` (throws). The analyze route still downloads/blurs the
  uploaded photo, so a real (any) image is required to reach the report.
- **Stripe payment leg is optional.** Everything up to the blurred report works
  without Stripe. Only the checkout/unlock step needs `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, and the three `STRIPE_PRICE_*` IDs.
- **`trailingSlash: true`** (`next.config.ts`): hit API routes with a trailing
  slash (e.g. `/api/health/`) to avoid a redirect.
- **`next lint` needs an ESLint config.** `.eslintrc.json`
  (`extends: next/core-web-vitals`) is committed so `npm run lint` runs
  non-interactively; without it `next lint` prompts and blocks on a TTY.
- **Local auth auto-confirms.** `supabase/config.toml` sets
  `enable_confirmations = false`, and `/api/auth/signup` uses
  `admin.createUser({ email_confirm: true })`, so signup needs no email step locally.
