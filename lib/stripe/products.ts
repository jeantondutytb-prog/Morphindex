export const PRICE_IDS = {
  hebdo: process.env.STRIPE_PRICE_HEBDO ?? "",
  annuel: process.env.STRIPE_PRICE_ANNUEL ?? "",
  vie: process.env.STRIPE_PRICE_VIE ?? "",
} as const;

export type Formule = keyof typeof PRICE_IDS;

export const FORMULES: { id: Formule; label: string; price: string; period?: string; recommended?: boolean }[] = [
  { id: "hebdo", label: "Hebdomadaire", price: "4,90 €", period: "/ semaine" },
  { id: "annuel", label: "Annuel", price: "29,90 €", period: "/ an", recommended: true },
  { id: "vie", label: "À vie", price: "59,90 €" },
];
