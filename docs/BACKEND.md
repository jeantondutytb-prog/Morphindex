# Backend Morphindex — mise en place

Ce document décrit le passage de « tout en `localStorage` » à un vrai backend.
Il est découpé en phases : **chaque phase est déployable et vérifiable seule.**

## Architecture retenue

```
morphindex.com  →  Vercel
  /                     frontend statique actuel (inchangé)
  /app/                 frontend statique actuel (inchangé)
  /api/*.js             fonctions serverless (service_role)
                            ↓
                        Supabase
                        profiles · analyses · projections
                        Auth · Storage (buckets privés)
```

**Pourquoi des routes serveur et pas Supabase depuis le navigateur ?**
Le schéma active l'RLS sur `analyses` **sans aucune policy SELECT**, volontairement.
Une policy « propriétaire » retournerait la ligne entière — scores, plan, chemins des
images — sans tenir compte de `analyses.unlocked_at`, le marqueur du paywall.
L'utilisateur lirait donc son analyse payante depuis la console, sans payer.
Toute lecture passe par le serveur avec `service_role`. Voir les commentaires dans
`supabase/migrations/0001_init.sql` — ils ne sont pas décoratifs.

---

## Phase 1 — Hébergement et schéma

### 1.1 Créer le projet Supabase

1. [supabase.com](https://supabase.com) → **New project**
2. Région : **Europe (Frankfurt ou Paris)** — les photos de visage sont des données
   biométriques ; les héberger dans l'UE simplifie la conformité RGPD.
3. Note le mot de passe de la base (il n'est plus affiché ensuite).

> L'ancien projet (`ndqlvmwpszdidlrbiwvf`) a été supprimé — son DNS renvoie `NXDOMAIN`.
> Les identifiants de `Projects/morphindex/.env.local` sont morts. Seul le schéma survit.

### 1.2 Appliquer le schéma

SQL Editor → coller `supabase/migrations/0001_init.sql` → **Run**.

Crée : `profiles`, `analyses`, `projections`, les RPC de crédits
(`increment_credits`, `decrement_credits`), le trigger de création de profil,
et les politiques RLS.

Vérification :
```sql
select tablename from pg_tables where schemaname = 'public';
-- attendu : profiles, analyses, projections
```

### 1.3 Créer les buckets Storage

Storage → **New bucket**, tous en **privé** (jamais public) :

| Bucket | Usage | Nécessaire en phase |
|---|---|---|
| `analyses` | photo source + `analysis.json` | 3 |
| `projections` | previews nettes | plus tard |
| `projections-floutees` | previews floutées (avant paiement) | plus tard |

### 1.4 Déployer sur Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importer `Morphindex`
2. Framework preset : **Other**. Aucune commande de build, aucun dossier de sortie.
   `vercel.json` à la racine fait le reste.
3. Déployer → une URL `*.vercel.app` apparaît. **Vérifier le site dessus avant de
   toucher au DNS.**

### 1.5 Basculer le DNS (OVH)

⚠️ **Seulement après validation sur l'URL `*.vercel.app`.**

Remplacer les enregistrements GitHub Pages par ceux indiqués par Vercel
(Settings → Domains) — en général :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Supprimer les 4 enregistrements A pointant vers `185.199.10x.153` (GitHub).
Propagation : quelques minutes à 48 h. Vercel émet le certificat TLS
automatiquement.

**Rollback :** remettre les A GitHub et réactiver Pages. Le repo reste inchangé,
`vercel.json` est inerte sur GitHub Pages.

---

## Phase 2 — Authentification

Remplacer `assets/auth.js` (comptes `localStorage`, SHA-256 sans sel) par Supabase Auth.

- Inscription / connexion / déconnexion
- **Vérification d'e-mail** (impossible aujourd'hui)
- **Réinitialisation de mot de passe** (`/mot-de-passe-oublie/` ne fait rien)
- Le trigger `on_auth_user_created` crée la ligne `profiles` avec 1 crédit

À supprimer à cette étape : `morphindex-users`, `morphindex-session`,
`morphindex-dev-unlimited`, et la fonction `hashPassword`.

**Migration des comptes existants : impossible.** Les mots de passe sont des
hachages SHA-256 non salés côté navigateur, inutilisables par Supabase. Les
utilisateurs actuels devront recréer un compte. Prévoir un message dédié.

## Phase 3 — Données et photos

- `GET/POST /api/scan` → table `analyses` via `service_role`
- Upload photo → bucket `analyses`, privé, URL signée à durée limitée
- Débit d'un crédit via `decrement_credits` **avant** l'analyse ; remboursement via
  `increment_credits` si elle échoue (c'est exactement le rôle de ces deux RPC)
- Import unique des analyses `localStorage` à la première connexion

## Phase 4 — Paiement

- `POST /api/stripe/checkout` → session Stripe Checkout
- `POST /api/stripe/webhook` → `customer.subscription.*` met à jour `profiles.plan`
- `isPro()` lit **le serveur**, plus `localStorage`
- Rétablir l'affichage du prix (retiré tant que rien n'était encaissable)

⚠️ Le webhook doit vérifier la signature avec `STRIPE_WEBHOOK_SECRET`, et lire le
corps **brut** de la requête. Sur Vercel, désactiver le parsing JSON pour cette route.

---

## Code réutilisable

| Source | Quoi | Remarque |
|---|---|---|
| `Projects/morphindex/supabase/migrations/` | schéma | ✅ repris ici tel quel |
| `MorphIndex_Main/api/stripe.js` | Checkout + webhook | à adapter : écrit dans `user_metadata`, pas dans `profiles` |
| `MorphIndex_Main/lib/supabase-storage.js` | upload Storage | création de bucket à retirer (fait à la main) |
| `MorphIndex_Main/lib/auth.js` | vérification de token | ✅ directement réutilisable |

## Sécurité — invariants à ne jamais casser

1. `SUPABASE_SERVICE_ROLE_KEY` ne quitte jamais le serveur.
2. Aucune policy SELECT sur `analyses` / `projections`.
3. Les crédits ne s'écrivent que via les RPC, appelées avec `service_role`.
4. `isPro` / `credits` / `plan` ne sont jamais lus depuis une valeur écrite par le client.
5. Buckets Storage privés, accès par URL signée uniquement.
