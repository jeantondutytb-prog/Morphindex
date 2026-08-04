import type { SupabaseClient } from "@supabase/supabase-js";

/** 2 analyses complètes par mois, toutes formules confondues, y compris « à vie ».
 *  Une routine met des semaines à produire un effet visible : personne n'a
 *  besoin de se réanalyser plus souvent. */
export const MONTHLY_QUOTA = 2;

/** L'analyse qui produit l'écran flouté, avant tout paiement. */
export const FREE_ANALYSES = 1;

type Sub = { status: string | null; quota_used: number; quota_reset_at: string };

/**
 * Décision pure : le quota autorise-t-il une analyse de plus ?
 *
 * Cette fonction ne consomme rien. La consommation réelle passe par
 * `consumeCreditOrReject`, qui délègue à une fonction Postgres atomique — un
 * lire-puis-écrire côté application laissait passer une analyse de trop en
 * cas de requêtes concurrentes. `canConsume` reste la source de vérité des
 * règles et sert à formuler le bon message de refus.
 */
export function canConsume(sub: Sub, now: Date): { ok: true } | { ok: false; error: string } {
  const used = new Date(sub.quota_reset_at) <= now ? 0 : sub.quota_used;

  // Un compte qui a payé puis annulé n'est pas un compte qui n'a jamais payé :
  // il a déjà consommé son analyse gratuite avant de souscrire.
  if (sub.status === "canceled" || sub.status === "past_due") {
    return { ok: false, error: "Débloque ton rapport pour lancer une nouvelle analyse." };
  }

  if (sub.status === "active") {
    return used < MONTHLY_QUOTA
      ? { ok: true }
      : { ok: false, error: `Tu as utilisé tes ${MONTHLY_QUOTA} analyses du mois.` };
  }

  return used < FREE_ANALYSES
    ? { ok: true }
    : { ok: false, error: "Débloque ton rapport pour lancer une nouvelle analyse." };
}

/**
 * Consomme un crédit de façon atomique via `public.consume_credit`
 * (migration 0004). La fonction Postgres verrouille la ligne, applique la
 * limite correspondant au statut et refait la vérification dans l'instruction
 * d'écriture : deux appels simultanés ne peuvent plus accorder deux crédits.
 */
export async function consumeCreditOrReject(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await admin.rpc("consume_credit", {
    p_user: userId,
    p_free_limit: FREE_ANALYSES,
    p_paid_limit: MONTHLY_QUOTA,
  });

  if (error) {
    return { ok: false, error: "Impossible de vérifier ton quota. Réessaie." };
  }
  if (data === true) {
    return { ok: true };
  }

  // Refusé : on relit uniquement pour formuler le bon message. Ce chemin n'est
  // emprunté qu'en cas de refus, donc il ne coûte rien au cas nominal.
  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, quota_used, quota_reset_at")
    .eq("user_id", userId)
    .single();

  if (!sub) return { ok: false, error: "Compte introuvable." };

  const verdict = canConsume(sub, new Date());
  return verdict.ok
    // La fonction atomique a refusé alors que la relecture dit oui : une autre
    // requête a consommé le crédit entre les deux. C'est exactement la course
    // que le verrou empêche, vue depuis le perdant.
    ? { ok: false, error: "Une analyse est déjà en cours. Réessaie dans un instant." }
    : verdict;
}

/** Rend le crédit après un échec d'analyse. Atomique côté Postgres. */
export async function refundCredit(admin: SupabaseClient, userId: string): Promise<void> {
  await admin.rpc("refund_credit", { p_user: userId });
}
