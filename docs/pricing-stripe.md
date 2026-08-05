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

## Prix MorphIndex (config actuelle)

| Formule | Prix affiché | Marge estimée | Note |
|---------|--------------|---------------|------|
| **Hebdomadaire** | **4,90 € / semaine** | ~93 % | Prix bas pour faciliter la conversion ; frais Stripe fixes plus lourds |
| **Annuel** *(recommandé)* | **49,90 € / an** | ~95 % | Meilleure marge — 1 seul prélèvement Stripe |
| **À vie** | **99,90 €** (paiement unique) | ~95 % | Rentable si usage ≤ ~2 analyses/mois pendant ~4 ans |

### Hebdo à 4,90 € — compromis conversion / marge

À 4,90 €/sem, Stripe prélève **~1,28 €/mois** en frais fixes (0,25 € × ~4 prélèvements). Sur ~21 € de CA mensuel, la marge reste **~93 %** (API incluse) — légèrement sous l'objectif 95 %, mais le ticket d'entrée bas peut améliorer le taux de conversion.

L'**annuel** compense : **49,90 €/an** ≈ **4,16 €/mois** vs **~21 €/mois** en hebdo → bon levier pour pousser l'offre recommandée.

### Équivalents utiles pour le marketing

- Hebdo 4,90 €/sem ≈ **21 €/mois** · **~255 €/an** si l'utilisateur reste en hebdo
- Annuel 49,90 € ≈ **4,16 €/mois** → économie ~**80 %** vs hebdo
- À vie 99,90 € = 2 ans d'hebdo, puis gratuit

## Configuration Stripe (Dashboard)

Créer **3 produits** en mode test puis live, avec les montants **exactement** ci-dessus.

### 1. MorphIndex Hebdomadaire

- Type : **Abonnement récurrent**
- Intervalle : **hebdomadaire**
- Montant : **4,90 EUR**
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

### 4. MorphIndex — Débloquer un rapport

- Type : **Paiement unique**
- Montant : **9,90 EUR**
- Copier le **Price ID** → `STRIPE_PRICE_UNLOCK`

### 5. MorphIndex — Nouvelle analyse

- Type : **Paiement unique**
- Montant : **14,90 EUR**
- Copier le **Price ID** → `STRIPE_PRICE_ANALYSE`

## Variables Vercel

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_UNLOCK=price_...
STRIPE_PRICE_ANALYSE=price_...
STRIPE_PRICE_HEBDO=price_...
STRIPE_PRICE_ANNUEL=price_...
STRIPE_PRICE_VIE=price_...
```

## Modèle économique

| Étape | Prix | Ce que l'utilisateur obtient |
|-------|------|------------------------------|
| 1re analyse | Gratuit | Rapport flouté (aperçu) |
| Débloquer ce rapport | **9,90 €** | Rapport complet + routine |
| Nouvelle analyse | **14,90 €** | Nouvelle analyse + rapport débloillé |
| Abonnement | 4,90 €/sem · 49,90 €/an · 99,90 € vie | 2 analyses / mois · rapports débloillés |

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
