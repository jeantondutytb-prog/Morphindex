export const PRICE_IDS = {
  /** Débloquer un rapport déjà généré (aperçu flouté) */
  unlock: process.env.STRIPE_PRICE_UNLOCK ?? "",
  /** Une nouvelle analyse complète + rapport débloqué */
  analyse: process.env.STRIPE_PRICE_ANALYSE ?? "",
  hebdo: process.env.STRIPE_PRICE_HEBDO ?? "",
  annuel: process.env.STRIPE_PRICE_ANNUEL ?? "",
  vie: process.env.STRIPE_PRICE_VIE ?? "",
} as const;

export type Formule = keyof typeof PRICE_IDS;

export type CheckoutIntent = "unlock_report" | "new_analysis" | "subscription";

export function checkoutIntent(formule: Formule): CheckoutIntent {
  if (formule === "unlock") return "unlock_report";
  if (formule === "analyse") return "new_analysis";
  return "subscription";
}

export function isOneTimePayment(formule: Formule): boolean {
  return formule === "vie" || formule === "unlock" || formule === "analyse";
}

/** Offres affichées sur le paywall d'un rapport verrouillé */
export const UNLOCK_OFFERS: {
  id: Formule;
  label: string;
  price: string;
  period?: string;
  hint?: string;
  recommended?: boolean;
}[] = [
  {
    id: "unlock",
    label: "Débloquer ce rapport",
    price: "9,90 €",
    hint: "Paiement unique · rapport complet + routine",
    recommended: true,
  },
  { id: "hebdo", label: "Hebdomadaire", price: "4,90 €", period: "/ semaine", hint: "2 analyses / mois incluses" },
  {
    id: "annuel",
    label: "Annuel",
    price: "49,90 €",
    period: "/ an",
    hint: "≈ 4,16 €/mois · 2 analyses / mois",
  },
  { id: "vie", label: "À vie", price: "99,90 €", hint: "Paiement unique · 2 analyses / mois" },
];

/** Alias rétrocompatibilité */
export const FORMULES = UNLOCK_OFFERS;

export const NEW_ANALYSIS_OFFER = {
  id: "analyse" as const,
  label: "Nouvelle analyse",
  price: "14,90 €",
  hint: "1 analyse complète · rapport débloillé immédiatement",
};
