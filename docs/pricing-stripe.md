# Tarification Stripe — marge cible 95 %

Objectif : **marge brute ≥ 95 %** après frais Stripe et coût API Anthropic (usage quota max).

## Coûts variables (par analyse)

| Poste | Estimation |
|-------|------------|
| API Claude Sonnet 5 (photo + prompt + JSON) | **~0,04 €** (tarif intro août 2026) · **~0,06 €** (tarif standard dès sept. 2026) |
| Supabase / stockage image floutée | négligeable (< 0,01 €) |

Hypothèse quota payant : **2 analyses / mois** (`lib/credits/quota.ts`).

## Frais Stripe (cartes EU)

**1,4 % + 0,25 €** par prélèvement réussi (tarif standard France).

> L'analyse gratuite avant paiement est un **coût d'acquisition** (~0,04 € par visiteur qui va jusqu'au rapport flouté), pas incluse dans la marge unitaire d'un abonné.

## Formule marge

```
Marge = (Prix − Coûts) / Prix
Coûts = Frais Stripe + (nb_analyses × coût_API)
```

Pour **95 % de marge** : `Prix ≥ Coûts / 0,05`

## Prix recommandés (marge ≥ 95 %, tarif API standard)

| Formule | Prix affiché | Coût max estimé | Marge |
|---------|--------------|-----------------|-------|
| **Hebdomadaire** | **9,99 € / semaine** | ~1,15 € / mois | ~95 % |
| **Annuel** *(recommandé)* | **49,90 € / an** | ~2,45 € / an | ~95 % |
| **À vie** | **99,90 €** (paiement unique) | ~6,50 € sur ~4 ans d'usage intensif | ~95 % |

### Pourquoi pas 4,90 € / semaine ?

À 4,90 €/sem, Stripe prélève **~1,28 €/mois** rien qu'en frais fixes (0,25 € × 4 prélèvements). Sur ~21 € de CA mensuel, ça représente **> 6 %** — impossible d'atteindre 95 % de marge avec l'hebdo à ce prix.

L'**annuel** est la formule la plus rentable : **1 seul prélèvement**, frais Stripe minimaux.

### Équivalents utiles pour le marketing

- Hebdo 9,99 €/sem ≈ **43 €/mois** si l'utilisateur reste en hebdo
- Annuel 49,90 € ≈ **4,16 €/mois** → argument fort vs hebdo
- À vie 99,90 € = rentable si usage moyen ≤ ~2 analyses/mois pendant ~4 ans

## Configuration Stripe (Dashboard)

Créer **3 produits** en mode test puis live, avec les montants **exactement** ci-dessus.

### 1. MorphIndex Hebdomadaire

- Type : **Abonnement récurrent**
- Intervalle : **hebdomadaire**
- Montant : **9,99 EUR**
- Copier le **Price ID** → `STRIPE_PRICE_HEBDO`

### 2. MorphIndex Annuel

- Type : **Abonnement récurrent**
- Intervalle : **annuel**
- Montant : **49,90 EUR**
- Copier le **Price ID** → `STRIPE_PRICE_ANNUEL`

### 3. MorphIndex À vie

- Type : **Paiement unique** (one-time)
- Montant : **99,90 EUR**
- Copier le **Price ID** → `STRIPE_PRICE_VIE`

## Variables Vercel

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_HEBDO=price_...
STRIPE_PRICE_ANNUEL=price_...
STRIPE_PRICE_VIE=price_...
```

Les montants affichés dans l'app (`lib/stripe/products.ts`) doivent **correspondre** aux Prices Stripe — c'est Stripe qui encaisse, le code n'affiche que le libellé.

## Webhook

URL : `https://www.morphindex.com/api/stripe/webhook`

Événements :

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Ajuster plus tard

Si tu changes le quota (`MONTHLY_QUOTA`) ou le modèle IA :

1. Recalcule : `coût_mensuel = quota × coût_API + frais_Stripe`
2. `prix_min = coût_mensuel / 0,05`
3. Crée un **nouveau Price** dans Stripe (les anciens restent pour les abonnés existants)
4. Mets à jour le Price ID dans Vercel + les libellés dans `products.ts`
