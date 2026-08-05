import type { SupabaseClient } from "@supabase/supabase-js";
import { canConsume, FREE_ANALYSES } from "./quota";
import { FOLLOW_UP_OFFER } from "@/lib/stripe/products";

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
  hasActiveSubscription: boolean;
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
      hasActiveSubscription: true,
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
  const limit = FREE_ANALYSES;
  const remaining = Math.max(0, limit - used);
  const verdict = sub ? canConsume({ ...sub, prepaid_credits: prepaidCredits }, now) : { ok: true as const };

  let hint: string;
  let label: string;

  if (prepaidCredits > 0) {
    label = `${prepaidCredits} analyse${prepaidCredits > 1 ? "s" : ""} de suivi`;
    hint = "Crédit prépayé — rapport débloillé automatiquement";
  } else if (used < FREE_ANALYSES) {
    label = "1 gratuite (aperçu flouté)";
    hint = hasActive
      ? "Première analyse offerte · abonnement actif pour le déblocage"
      : "Première analyse offerte · abonnement requis pour débloquer le rapport";
  } else if (hasActive) {
    label = "Abonnement actif";
    hint = `Analyse de suivi : ${FOLLOW_UP_OFFER.price} — compare ta progression`;
  } else {
    label = "Paiement requis";
    hint = `Analyse de suivi : ${FOLLOW_UP_OFFER.price} · ou abonne-toi pour débloquer ton rapport`;
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
    hasActiveSubscription: hasActive,
  };
}
