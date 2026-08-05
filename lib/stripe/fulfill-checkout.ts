import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export type FulfillResult =
  | { ok: true; alreadyProcessed: boolean; intent: string }
  | { ok: false; error: string };

async function wasSessionFulfilled(
  admin: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("events")
    .select("id")
    .eq("type", "checkout_fulfilled")
    .contains("payload", { stripe_session_id: sessionId })
    .limit(1)
    .maybeSingle();

  return data != null;
}

export async function fulfillCheckoutSession(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<FulfillResult> {
  const sessionId = session.id;

  if (await wasSessionFulfilled(admin, sessionId)) {
    const intent = session.metadata?.intent ?? "subscription";
    return { ok: true, alreadyProcessed: true, intent };
  }

  const userId = session.metadata?.user_id;
  const analysisId = session.metadata?.analysis_id || null;
  const formule = session.metadata?.formule;
  const intent = session.metadata?.intent ?? "subscription";

  if (!userId || !formule) {
    return { ok: false, error: "metadata checkout manquante" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: "paiement non confirmé" };
  }

  if (intent === "new_analysis") {
    const { error: rpcError } = await admin.rpc("add_prepaid_credit", {
      p_user: userId,
      p_n: 1,
    });
    if (rpcError) return { ok: false, error: rpcError.message };

    const { error: eventError } = await admin.from("events").insert({
      user_id: userId,
      type: "analysis_purchased",
      payload: { formule, stripe_session_id: sessionId },
    });
    if (eventError) return { ok: false, error: eventError.message };
  } else {
    const { error: subError } = await admin
      .from("subscriptions")
      .update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: (session.subscription as string) ?? null,
        formule,
        status: "active",
        withdrawal_waived_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (subError) return { ok: false, error: subError.message };

    if (analysisId) {
      const { error: unlockError } = await admin
        .from("analyses")
        .update({ unlocked: true })
        .eq("id", analysisId)
        .eq("user_id", userId);
      if (unlockError) return { ok: false, error: unlockError.message };
    }

    const { error: eventError } = await admin.from("events").insert({
      user_id: userId,
      type: "payment_succeeded",
      payload: { formule, stripe_session_id: sessionId, analysis_id: analysisId },
    });
    if (eventError) return { ok: false, error: eventError.message };
  }

  const { error: markerError } = await admin.from("events").insert({
    user_id: userId,
    type: "checkout_fulfilled",
    payload: { stripe_session_id: sessionId, intent, formule },
  });
  if (markerError) return { ok: false, error: markerError.message };

  return { ok: true, alreadyProcessed: false, intent };
}
