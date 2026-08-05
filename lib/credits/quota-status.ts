import type { SupabaseClient } from "@supabase/supabase-js";
import { canConsume, FREE_ANALYSES, MONTHLY_QUOTA } from "./quota";

export type QuotaStatus = {
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  canAnalyze: boolean;
  label: string;
  hint: string;
};

export async function getQuotaStatus(
  admin: SupabaseClient,
  userId: string,
  isAdmin: boolean,
): Promise<QuotaStatus> {
  if (isAdmin) {
    return {
      unlimited: true,
      used: 0,
      limit: 0,
      remaining: 999,
      canAnalyze: true,
      label: "Illimité",
      hint: "Compte admin — analyses sans limite",
    };
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, quota_used, quota_reset_at")
    .eq("user_id", userId)
    .single();

  const now = new Date();
  const used = sub && new Date(sub.quota_reset_at) > now ? sub.quota_used : 0;
  const hasActive = sub?.status === "active";
  const limit = hasActive ? MONTHLY_QUOTA : FREE_ANALYSES;
  const remaining = Math.max(0, limit - used);
  const verdict = sub ? canConsume(sub, now) : { ok: true as const };

  let hint: string;
  if (hasActive) {
    hint = `${used} / ${limit} utilisée(s) ce mois · abonnement actif`;
  } else if (used >= FREE_ANALYSES) {
    hint = "Quota gratuit épuisé — débloque ton rapport ou abonne-toi pour continuer";
  } else {
    hint = `${remaining} analyse gratuite incluse avant déblocage`;
  }

  return {
    unlimited: false,
    used,
    limit,
    remaining,
    canAnalyze: verdict.ok,
    label: remaining > 0 ? `${remaining} restante${remaining > 1 ? "s" : ""}` : "Quota épuisé",
    hint,
  };
}
