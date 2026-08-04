# Mettre morphindex.com en production (Vercel)

L'application Next.js remplace l'ancien site GitHub Pages. Voici la bascule
dans l'ordre — ne pas inverser DNS et GitHub Pages avant le premier déploiement
Vercel vert.

## 1. Vercel — importer le projet

1. [vercel.com/new](https://vercel.com/new) → importer **jeantondutytb-prog/Morphindex**
2. Branche de production : **`main`**
3. Framework : Next.js (détecté automatiquement)
4. Variables d'environnement (Settings → Environment Variables) — copier depuis `.env.local` :

| Variable | Production |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui |
| `SUPABASE_SERVICE_ROLE_KEY` | oui |
| `ANTHROPIC_API_KEY` | oui (ou laisser vide + ne pas activer `MORPHINDEX_FAKE_ANALYSIS` en prod) |
| `STRIPE_SECRET_KEY` | oui |
| `STRIPE_WEBHOOK_SECRET` | oui |
| `NEXT_PUBLIC_SITE_URL` | `https://www.morphindex.com` |
| `STRIPE_PRICE_HEBDO` / `ANNUEL` / `VIE` | oui |
| `MORPHINDEX_FAKE_ANALYSIS` | **ne jamais définir** |

5. Déployer. Noter l'URL `*.vercel.app` et vérifier que la landing s'affiche.

## 2. Vercel — domaines custom

Settings → Domains → ajouter :

- `www.morphindex.com` (domaine principal — webhook Stripe, `NEXT_PUBLIC_SITE_URL`)
- `morphindex.com` (Vercel redirige vers `www` si configuré)

Attendre que Vercel affiche les enregistrements DNS à créer.

## 3. OVH — remplacer GitHub Pages par Vercel

Zone DNS → **supprimer** les enregistrements GitHub Pages :

```
❌ @ A     185.199.108.x / 109 / 110 / 111
❌ @ AAAA  2606:50c0:800x::153
❌ www CNAME jeantondutytb-prog.github.io
```

**Ajouter** (valeurs exactes affichées dans Vercel → Domains ; typiquement) :

```
✅ @   A     76.76.21.21
✅ www CNAME cname.vercel-dns.com.
```

Conserver les enregistrements **MX** (mail OVH) — ne pas les toucher.

Propagation : 5 min à 24 h. Vérifier :

```bash
dig morphindex.com A +short
dig www.morphindex.com CNAME +short
```

## 4. GitHub Pages — désactiver

Repo → **Settings → Pages** → Source : **None** (désactiver).

Le fichier `CNAME` a été retiré du dépôt pour éviter qu'un futur déploiement Pages
ne reprenne le domaine.

## 5. Supabase

Authentication → URL Configuration → Redirect URLs :

- `https://www.morphindex.com/**`
- `https://morphindex.com/**`
- URL de preview Vercel si besoin

Site URL : `https://www.morphindex.com`

## 6. Stripe

Webhook endpoint (live ou test) :

```
https://www.morphindex.com/api/stripe/webhook
```

⚠️ Sur le sous-domaine **`www.`** — Stripe ne suit pas les redirections 308 depuis l'apex.

## 7. Recette post-bascule

- [ ] `https://www.morphindex.com/` — landing
- [ ] Inscription → onboarding → photo → analyse → rapport flouté
- [ ] Checkout Stripe test
- [ ] Webhook reçu sur `www.`
- [ ] Mot de passe oublié → email → `/auth/callback/` → nouveau mot de passe

## Ancien site

Les commits antérieurs au MVP Next.js restent dans l'historique git. Seul **`main`**
sert la production Vercel.
