export const PRICE_IDS = {
  hebdo: process.env.STRIPE_PRICE_HEBDO ?? "",
  annuel: process.env.STRIPE_PRICE_ANNUEL ?? "",
  vie: process.env.STRIPE_PRICE_VIE ?? "",
} as const;

export type Formule = keyof typeof PRICE_IDS;

/** Voir docs/pricing-stripe.md pour le détail marge / Stripe */
export const FORMULES: { id: Formule; label: string; price: string; period?: string; hint?: string; recommended?: boolean }[] = [
  { id: "hebdo", label: "Hebdomadaire", price: "4,90 €", period: "/ semaine" },
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
