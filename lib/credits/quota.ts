import type { SupabaseClient } from "@supabase/supabase-js";

/** 2 analyses / mois incluses dans l'abonnement actif. */
export const MONTHLY_QUOTA = 2;

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

  if (sub.status === "canceled" || sub.status === "past_due") {
    return {
      ok: false,
      error: "Achète une analyse (14,90 €) ou réactive ton abonnement pour continuer.",
    };
  }

  if (sub.status === "active") {
    return used < MONTHLY_QUOTA
      ? { ok: true }
      : {
          ok: false,
          error: `Tu as utilisé tes ${MONTHLY_QUOTA} analyses du mois. Achète une analyse à l'unité ou attends le mois prochain.`,
        };
  }

  return used < FREE_ANALYSES
    ? { ok: true }
    : {
        ok: false,
        error: "Achète une nouvelle analyse (14,90 €) ou débloque ton rapport avec un abonnement.",
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

export function shouldUnlockReport(source: ConsumeSource): boolean {
  return source === "prepaid" || source === "monthly";
}
