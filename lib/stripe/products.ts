export const PRICE_IDS = {
  hebdo: process.env.STRIPE_PRICE_HEBDO ?? "",
  annuel: process.env.STRIPE_PRICE_ANNUEL ?? "",
  vie: process.env.STRIPE_PRICE_VIE ?? "",
} as const;

export type Formule = keyof typeof PRICE_IDS;

/** Montants calibrés pour ~95 % de marge brute (API + Stripe, quota max). Voir docs/pricing-stripe.md */
export const FORMULES: { id: Formule; label: string; price: string; period?: string; hint?: string; recommended?: boolean }[] = [
  { id: "hebdo", label: "Hebdomadaire", price: "9,99 €", period: "/ semaine" },
  {
    id: "annuel",
    label: "Annuel",
    price: "49,90 €",
    period: "/ an",
    hint: "≈ 4,16 €/mois",
    recommended: true,
  },
  { id: "vie", label: "À vie", price: "99,90 €", hint: "Paiement unique" },
];
