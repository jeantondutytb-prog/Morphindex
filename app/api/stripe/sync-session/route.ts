import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfill-checkout";

export async function GET(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.json({ error: "session_id invalide" }, { status: 400 });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "session introuvable" }, { status: 404 });
  }

  const ownerId = session.metadata?.user_id ?? session.client_reference_id;
  if (ownerId !== user.id) {
    return NextResponse.json({ error: "session non autorisée" }, { status: 403 });
  }

  const admin = createAdminClient();
  const result = await fulfillCheckoutSession(admin, session);

  if (!result.ok) {
    console.error("[stripe/sync-session]", sessionId, result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    synced: true,
    alreadyProcessed: result.alreadyProcessed,
    intent: result.intent,
  });
}
