# Recette production — tunnel complet

Site : **https://www.morphindex.com**

Cocher au fur et à mesure. En cas d'échec, noter le message exact et l'étape.

## Prérequis Vercel (Production)

| Variable | Requis pour |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY` | Auth, BDD, upload |
| `NEXT_PUBLIC_SITE_URL` = `https://www.morphindex.com` | Redirects, Stripe return URLs |
| `ANTHROPIC_API_KEY` | Analyse réelle (pas de fake en prod) |
| `STRIPE_SECRET_KEY` + `STRIPE_PRICE_*` | Checkout paywall |
| `STRIPE_WEBHOOK_SECRET` | Déblocage rapport après paiement |

Après toute modif de variable `NEXT_PUBLIC_*` → **Redeploy** obligatoire.

## Prérequis Supabase

- Migrations `0001` à `0004` appliquées
- Bucket `photos` **privé**
- Redirect URLs : `https://www.morphindex.com/**`
- Site URL : `https://www.morphindex.com`
- **Email** : si confirmation activée, le tunnel s'arrête après signup tant que l'email n'est pas confirmé → désactiver en recette ou confirmer l'email

## Prérequis Stripe (mode test)

1. Produits : hebdo 4,90 € · annuel 29,90 € · vie 59,90 €
2. Price IDs dans Vercel : `STRIPE_PRICE_HEBDO`, `STRIPE_PRICE_ANNUEL`, `STRIPE_PRICE_VIE`
3. Webhook : `https://www.morphindex.com/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Parcours (recette §11)

### 1. Landing
- [ ] `https://www.morphindex.com/` — hero, pas d'avis/témoignages (G14)
- [ ] Clic colonne Hardmaxing → événement `hardmaxing_interest` en base (`events`)

### 2. Inscription
- [ ] `/inscription/` — bouton disabled sans les 2 cases
- [ ] POST forgé sans `ageConfirmed` → 400
- [ ] Compte créé → `age_confirmed_at` et `terms_accepted_at` renseignés en base

### 3. Onboarding
- [ ] 5 écrans → `onboarding_done_at` posé
- [ ] POST `mode_prefere: "hard"` → 400

### 4. Photo + analyse
- [ ] Upload JPEG/PNG → bucket `photos`
- [ ] Analyse → rapport flouté (`/app/rapport/{id}`)
- [ ] Réseau : preview ne contient **ni** scores **ni** image nette
- [ ] Source supprimée du bucket ; `photo_deleted_at` renseigné

### 5. Paywall + paiement
- [ ] 3 formules affichées ; case rétractation obligatoire au checkout Stripe
- [ ] Carte test `4242 4242 4242 4242`
- [ ] Webhook reçu sur **www.** → `unlocked = true`
- [ ] Rapport complet sans photo floutée

### 6. Auth secondaire
- [ ] Mot de passe oublié → email → `/auth/callback/` → `/nouveau-mot-de-passe/` → connexion

### 7. Quotas
- [ ] 2ᵉ analyse sans abonnement → 402
- [ ] Analyse échouée → crédit remboursé

---

## Carte Stripe test

```
4242 4242 4242 4242 · date future · CVC quelconque
```

## Commandes de vérif rapide

```bash
curl -sI https://www.morphindex.com/ | head -1
curl -sI https://morphindex.com/ | grep -i location
```

Succès attendu : `200` sur www, `308` vers www sur l'apex.
