import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prepareForModel } from "@/lib/image/prepare";
import { blurForPaywall } from "@/lib/image/blur";
import { runAnalysis } from "@/lib/ai/analyze";
import { onboardingSchema } from "@/lib/onboarding/schema";
import { consumeCreditOrReject, refundCredit, shouldUnlockReport } from "@/lib/credits/quota";

export const maxDuration = 120;

function userFacingError(detail: string): string {
  if (/invalid_output|sortie non conforme/i.test(detail)) {
    return "L'IA n'a pas produit un rapport valide. Réessaie dans un instant.";
  }
  if (/refusal|refus/i.test(detail)) {
    return "Photo refusée par les filtres de sécurité. Utilise une autre photo.";
  }
  if (/api_error|APIError|401|403|authentication/i.test(detail)) {
    return "Service d'analyse indisponible. Réessaie plus tard.";
  }
  if (/column.*dimensions|dimensions.*column/i.test(detail)) {
    return "Erreur base de données. Contacte le support.";
  }
  return "L'analyse n'a pas abouti. Réessaie.";
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const { path } = await req.json();
  if (typeof path !== "string" || !path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "chemin invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const adminBypass = profile?.is_admin === true;

  let consumeSource: import("@/lib/credits/quota").ConsumeSource | null = null;

  if (!adminBypass) {
    const gate = await consumeCreditOrReject(admin, user.id);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 402 });
    consumeSource = gate.source;
  }

  const p = onboardingSchema.safeParse(profile);
  if (!p.success) return NextResponse.json({ error: "onboarding incomplet" }, { status: 400 });

  if (profile?.saved_photo_path && path !== profile.saved_photo_path) {
    return NextResponse.json({ error: "photo non enregistrée" }, { status: 400 });
  }

  const { data: analysis } = await admin.from("analyses")
    .insert({ user_id: user.id, mode: "soft", status: "pending", model_used: "claude-sonnet-5" })
    .select("id").single();

  if (!analysis) {
    return NextResponse.json({ error: "Impossible de créer l'analyse." }, { status: 500 });
  }

  try {
    const { data: blob } = await admin.storage.from("photos").download(path);
    if (!blob) throw new Error("photo introupable");
    const buf = Buffer.from(await blob.arrayBuffer());
    const { base64 } = await prepareForModel(buf);

    const result = await runAnalysis(base64, p.data);
    if (!result.ok) throw new Error(`${result.reason}: ${result.detail}`);

    const blurred = await blurForPaywall(buf);
    const blurredPath = `${user.id}/${analysis.id}-blur.jpg`;
    await admin.storage.from("photos").upload(blurredPath, blurred, { contentType: "image/jpeg" });

    const rank = { fort: 0, moyen: 1, faible: 2 } as const;
    const points = [...result.data.points].sort((a, b) => rank[a.impact] - rank[b.impact]);

    const scoresPayload = {
      ...result.data.scores,
      dimensions: result.data.dimensions,
    };

    const updatePayload = {
      status: "done" as const,
      scores: scoresPayload,
      indice_actuel: result.data.indice_actuel,
      indice_atteignable: result.data.indice_atteignable,
      points,
      points_count: points.length,
      premier_point_libelle: points[0].libelle,
      routine: {
        items: result.data.routine,
        plan_semaines: result.data.plan_semaines,
        resume: result.data.routine_resume,
      },
      blurred_image_path: blurredPath,
      photo_deleted_at: null,
      unlocked: adminBypass || (consumeSource != null && shouldUnlockReport(consumeSource)),
    };

    // Colonne dimensions optionnelle (migration 0007) — scores.dimensions suffit en fallback.
    let { error: updateError } = await admin.from("analyses").update({
      ...updatePayload,
      dimensions: result.data.dimensions,
    }).eq("id", analysis.id);

    if (updateError?.message?.includes("dimensions")) {
      ({ error: updateError } = await admin.from("analyses").update(updatePayload).eq("id", analysis.id));
    }

    if (updateError) throw new Error(updateError.message);

    await admin.from("events").insert({
      user_id: user.id, type: "analysis_done",
      payload: { cache_read: result.cacheRead, admin_bypass: adminBypass },
    });

    return NextResponse.json({ analysisId: analysis.id });
  } catch (e) {
    if (!adminBypass && consumeSource) await refundCredit(admin, user.id, consumeSource);
    const detail = e instanceof Error ? e.message : String(e);
    await admin.from("analyses")
      .update({ status: "failed", error_reason: detail.slice(0, 500) })
      .eq("id", analysis.id);
    await admin.from("events").insert({
      user_id: user.id,
      type: "analysis_failed",
      payload: { detail: detail.slice(0, 200) },
    });
    return NextResponse.json(
      { error: userFacingError(detail), code: "analysis_failed" },
      { status: 500 },
    );
  }
}
