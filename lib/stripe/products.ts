export const PRICE_IDS = {
  /** Nouvelle analyse complète + rapport débloillé (suivi après routines) */
  analyse: process.env.STRIPE_PRICE_ANALYSE ?? "",
  hebdo: process.env.STRIPE_PRICE_HEBDO ?? "",
  annuel: process.env.STRIPE_PRICE_ANNUEL ?? "",
  vie: process.env.STRIPE_PRICE_VIE ?? "",
} as const;

export type Formule = keyof typeof PRICE_IDS;

export type CheckoutIntent = "new_analysis" | "subscription";

export function checkoutIntent(formule: Formule): CheckoutIntent {
  if (formule === "analyse") return "new_analysis";
  return "subscription";
}

export function isOneTimePayment(formule: Formule): boolean {
  return formule === "vie" || formule === "analyse";
}

/** Abonnements affichés sur le paywall (débloque le rapport + accès app) */
export const SUBSCRIPTION_OFFERS: {
  id: Formule;
  label: string;
  price: string;
  period?: string;
  hint?: string;
  recommended?: boolean;
}[] = [
  { id: "hebdo", label: "Hebdomadaire", price: "4,90 €", period: "/ semaine", hint: "2 analyses / mois incluses" },
  {
    id: "annuel",
    label: "Annuel",
    price: "49,90 €",
    period: "/ an",
    hint: "≈ 4,16 €/mois · 2 analyses / mois",
    recommended: true,
  },
  { id: "vie", label: "À vie", price: "99,90 €", hint: "Paiement unique · 2 analyses / mois" },
];

/** Alias rétrocompatibilité */
export const UNLOCK_OFFERS = SUBSCRIPTION_OFFERS;
export const FORMULES = SUBSCRIPTION_OFFERS;

export const NEW_ANALYSIS_OFFER = {
  id: "analyse" as const,
  label: "Nouvelle analyse",
  price: "6,90 €",
  hint: "1 analyse complète · rapport débloillé immédiatement",
};
