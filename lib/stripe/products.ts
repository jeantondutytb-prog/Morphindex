export const PRICE_IDS = {
  /** Analyse de suivi (complète la première analyse) */
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

/** Abonnements affichés sur le paywall d'un rapport verrouillé */
export const SUBSCRIPTION_OFFERS: {
  id: Formule;
  label: string;
  price: string;
  period?: string;
  hint?: string;
  recommended?: boolean;
}[] = [
  {
    id: "hebdo",
    label: "Hebdomadaire",
    price: "4,90 €",
    period: "/ semaine",
    hint: "Accès complet · renouvelable",
    recommended: true,
  },
  {
    id: "annuel",
    label: "Annuel",
    price: "49,90 €",
    period: "/ an",
    hint: "≈ 4,16 €/mois · meilleur rapport qualité-prix",
  },
  {
    id: "vie",
    label: "À vie",
    price: "99,90 €",
    hint: "Paiement unique · accès permanent",
  },
];

/** Alias rétrocompatibilité paywall */
export const UNLOCK_OFFERS = SUBSCRIPTION_OFFERS;

export const FOLLOW_UP_OFFER = {
  id: "analyse" as const,
  label: "Analyse de suivi",
  price: "7,90 €",
  hint: "Compare ta progression · routine ajustée · rapport débloillé",
};

/** Alias rétrocompatibilité */
export const NEW_ANALYSIS_OFFER = FOLLOW_UP_OFFER;
