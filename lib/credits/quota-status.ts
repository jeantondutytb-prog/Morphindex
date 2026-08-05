import type { SupabaseClient } from "@supabase/supabase-js";
import { canConsume, FREE_ANALYSES, MONTHLY_QUOTA } from "./quota";
import { NEW_ANALYSIS_OFFER } from "@/lib/stripe/products";

export type QuotaStatus = {
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  prepaidCredits: number;
  canAnalyze: boolean;
  label: string;
  hint: string;
  needsPurchase: boolean;
  latestLockedReportId: string | null;
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
      prepaidCredits: 0,
      canAnalyze: true,
      label: "Illimité",
      hint: "Compte admin — analyses sans limite",
      needsPurchase: false,
      latestLockedReportId: null,
    };
  }

  const { data: latestLocked } = await admin
    .from("analyses")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "done")
    .eq("unlocked", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, quota_used, quota_reset_at, prepaid_credits")
    .eq("user_id", userId)
    .single();

  const prepaidCredits = sub?.prepaid_credits ?? 0;
  const now = new Date();
  const used = sub && new Date(sub.quota_reset_at) > now ? sub.quota_used : 0;
  const hasActive = sub?.status === "active";
  const limit = hasActive ? MONTHLY_QUOTA : FREE_ANALYSES;
  const remaining = Math.max(0, limit - used);
  const verdict = sub ? canConsume({ ...sub, prepaid_credits: prepaidCredits }, now) : { ok: true as const };

  let hint: string;
  let label: string;

  if (prepaidCredits > 0) {
    label = `${prepaidCredits} crédit${prepaidCredits > 1 ? "s" : ""} prépayé${prepaidCredits > 1 ? "s" : ""}`;
    hint = "Analyse achetée — rapport débloqué automatiquement";
  } else if (hasActive) {
    label = `${remaining} / ${limit} ce mois`;
    hint =
      remaining > 0
        ? `${used} utilisée(s) · abonnement actif`
        : `Quota mensuel épuisé · ${NEW_ANALYSIS_OFFER.price} par analyse supplémentaire`;
  } else if (used >= FREE_ANALYSES) {
    label = "Paiement requis";
    hint = `Nouvelle analyse : ${NEW_ANALYSIS_OFFER.price} · ou souscris un abonnement pour débloquer ton rapport`;
  } else {
    label = "1 gratuite (aperçu flouté)";
    hint = "Première analyse offerte · débloque le rapport complet ensuite";
  }

  return {
    unlimited: false,
    used,
    limit,
    remaining,
    prepaidCredits,
    canAnalyze: verdict.ok,
    label,
    hint,
    needsPurchase: !verdict.ok && prepaidCredits === 0,
    latestLockedReportId: latestLocked?.id ?? null,
  };
}
