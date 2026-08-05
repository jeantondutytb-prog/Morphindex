import type { SupabaseClient } from "@supabase/supabase-js";

/** Abonnement = accès produit uniquement — pas d'analyses mensuelles incluses. */
export const MONTHLY_QUOTA = 0;

/** 1re analyse gratuite (rapport flouté) avant tout paiement. */
export const FREE_ANALYSES = 1;

export type ConsumeSource = "prepaid" | "monthly" | "free";

type Sub = {
  status: string | null;
  quota_used: number;
  quota_reset_at: string;
  prepaid_credits?: number;
};

export function canConsume(sub: Sub, now: Date): { ok: true } | { ok: false; error: string } {
  if ((sub.prepaid_credits ?? 0) > 0) {
    return { ok: true };
  }

  const used = new Date(sub.quota_reset_at) <= now ? 0 : sub.quota_used;

  if (used < FREE_ANALYSES) {
    return { ok: true };
  }

  if (sub.status === "canceled" || sub.status === "past_due") {
    return {
      ok: false,
      error: "Achète une analyse de suivi (7,90 €) ou réactive ton abonnement.",
    };
  }

  if (sub.status === "active") {
    return {
      ok: false,
      error: "Analyse de suivi : 7,90 € — compare ta progression avec ta première analyse.",
    };
  }

  return {
    ok: false,
    error: "Achète une analyse de suivi (7,90 €) ou souscris pour débloquer ton rapport.",
  };
}

export async function consumeCreditOrReject(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true; source: ConsumeSource } | { ok: false; error: string }> {
  const { data, error } = await admin.rpc("consume_credit", {
    p_user: userId,
    p_free_limit: FREE_ANALYSES,
    p_paid_limit: MONTHLY_QUOTA,
  });

  if (error) {
    return { ok: false, error: "Impossible de vérifier ton quota. Réessaie." };
  }

  if (data === "prepaid" || data === "monthly" || data === "free") {
    return { ok: true, source: data };
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, quota_used, quota_reset_at, prepaid_credits")
    .eq("user_id", userId)
    .single();

  if (!sub) return { ok: false, error: "Compte introuvable." };

  const verdict = canConsume(sub, new Date());
  return verdict.ok
    ? { ok: false, error: "Une analyse est déjà en cours. Réessaie dans un instant." }
    : verdict;
}

export async function refundCredit(
  admin: SupabaseClient,
  userId: string,
  source: ConsumeSource,
): Promise<void> {
  await admin.rpc("refund_credit", { p_user: userId, p_source: source });
}

/** Seules les analyses de suivi achetées à l'unité sont débloillées automatiquement. */
export function shouldUnlockReport(source: ConsumeSource): boolean {
  return source === "prepaid";
}
