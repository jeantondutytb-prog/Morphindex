/** 2 analyses complètes par mois, toutes formules confondues, y compris « à vie ». */
export const MONTHLY_QUOTA = 2;
export const FREE_ANALYSES = 1;

type Sub = { status: string | null; quota_used: number; quota_reset_at: string };

export function canConsume(sub: Sub, now: Date): { ok: true } | { ok: false; error: string } {
  const used = new Date(sub.quota_reset_at) <= now ? 0 : sub.quota_used;

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

import type { SupabaseClient } from "@supabase/supabase-js";

function nextReset(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

export async function consumeCreditOrReject(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, quota_used, quota_reset_at")
    .eq("user_id", userId)
    .single();

  if (!sub) return { ok: false, error: "Compte introuvable." };

  const verdict = canConsume(sub, now);
  if (!verdict.ok) return verdict;

  const expired = new Date(sub.quota_reset_at) <= now;
  await admin.from("subscriptions").update(
    expired
      ? { quota_used: 1, quota_reset_at: nextReset(now) }
      : { quota_used: sub.quota_used + 1 },
  ).eq("user_id", userId);

  return { ok: true };
}

export async function refundCredit(admin: SupabaseClient, userId: string): Promise<void> {
  const { data: sub } = await admin
    .from("subscriptions").select("quota_used").eq("user_id", userId).single();
  if (!sub) return;
  await admin.from("subscriptions")
    .update({ quota_used: Math.max(0, sub.quota_used - 1) })
    .eq("user_id", userId);
}
