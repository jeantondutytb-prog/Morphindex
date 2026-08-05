import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import {
  PRICE_IDS,
  checkoutIntent,
  isOneTimePayment,
  type Formule,
} from "@/lib/stripe/products";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const body = await req.json() as { formule: Formule; analysisId?: string };
  const { formule, analysisId } = body;

  if (!formule || !PRICE_IDS[formule]) {
    return NextResponse.json({ error: "paramètres invalides" }, { status: 400 });
  }

  const intent = checkoutIntent(formule);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.morphindex.com";

  const successUrl =
    intent === "new_analysis"
      ? `${siteUrl}/app/photo?paid=1`
      : `${siteUrl}/app/rapport/${analysisId}?ok=1`;

  const cancelUrl =
    intent === "new_analysis"
      ? `${siteUrl}/app/photo`
      : `${siteUrl}/app/rapport/${analysisId}`;

  const session = await getStripe().checkout.sessions.create({
    mode: isOneTimePayment(formule) ? "payment" : "subscription",
    line_items: [{ price: PRICE_IDS[formule], quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      formule,
      intent,
      analysis_id: analysisId ?? "",
    },
    locale: "fr",
    success_url: successUrl,
    cancel_url: cancelUrl,
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message:
          "J'accepte que le contenu numérique soit livré immédiatement et je renonce " +
          "expressément à mon droit de rétractation de 14 jours.",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
