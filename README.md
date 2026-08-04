# MorphIndex MVP v1

Application Next.js (App Router) pour l'analyse faciale MorphIndex.

## Stack

- Next.js 15 · TypeScript · Tailwind v4
- Supabase (auth PKCE + Postgres + Storage)
- Anthropic Claude Sonnet 5 · Stripe · Vitest · Sharp

## Démarrage local

```bash
cp .env.example .env.local
# Renseigner les variables (Supabase, Anthropic, Stripe)
npm install
npm run dev
```

## Migrations Supabase

Exécuter dans l'ordre dans le SQL Editor :

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_storage.sql`
3. `supabase/migrations/0003_rate_limit.sql`

Créer le bucket `photos` en privé si la migration storage ne le fait pas automatiquement.

## Tests

```bash
npm test
```

## Tunnel utilisateur

Landing → Inscription → Onboarding (5 écrans) → Photo → Analyse Claude Sonnet 5 → Rapport flouté → Paiement Stripe → Rapport complet

## Webhook Stripe

Configurer sur `https://www.morphindex.com/api/stripe/webhook` (sous-domaine `www.` obligatoire).
