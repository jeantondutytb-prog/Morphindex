import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LockedReportPreview } from "@/components/report/locked-preview";
import { ScoresPanel } from "@/components/report/scores";
import { RoutinePanel } from "@/components/report/routine";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AXES } from "@/lib/ai/analysis-schema";

type Point = { axe: string; libelle: string; impact: "faible" | "moyen" | "fort" };
type Scores = Record<(typeof AXES)[number], number>;

async function getPreview(id: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("analyses")
    .select("status, points_count, premier_point_libelle, blurred_image_path, user_id")
    .eq("id", id).single();

  if (!data || data.user_id !== userId) return null;

  const { data: signed } = await admin.storage
    .from("photos").createSignedUrl(data.blurred_image_path!, 300);

  return {
    status: data.status,
    points_count: data.points_count,
    premier_point_libelle: data.premier_point_libelle,
    blurred_url: signed?.signedUrl ?? null,
  };
}

export default async function RapportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: analysis } = await supabase.from("analyses").select("*").eq("id", id).single();

  if (analysis?.unlocked) {
    const scores = analysis.scores as Scores;
    const points = analysis.points as Point[];
    const routine = analysis.routine as Parameters<typeof RoutinePanel>[0]["routine"];

    return (
      <main className="min-h-screen px-5 py-12 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-extrabold mb-6">Ton rapport</h1>

        <div className="flex items-baseline gap-4 tnum mb-2">
          <span className="font-display text-5xl font-extrabold text-num-idle">
            {Number(analysis.indice_actuel).toFixed(1).replace(".", ",")}
          </span>
          <span className="text-2xl text-num-idle">→</span>
          <span className="font-display text-5xl font-extrabold text-accent">
            {Number(analysis.indice_atteignable).toFixed(1).replace(".", ",")}
          </span>
        </div>
        <p className="text-sm text-dim mb-8">
          Ton indice atteignable est un potentiel <strong className="text-muted">si tu suis la routine</strong>, pas une prédiction. Aucun résultat physique n&apos;est garanti.
        </p>

        <section className="mb-8">
          <h2 className="font-display font-bold mb-4">Sous-scores</h2>
          <ScoresPanel scores={scores} />
        </section>

        <section className="mb-8">
          <h2 className="font-display font-bold mb-4">Points d&apos;amélioration</h2>
          <ul className="space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <ImpactBadge impact={p.impact} />
                <span className="text-muted">{p.libelle}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold mb-4">Ta routine</h2>
          <RoutinePanel routine={routine} />
        </section>
      </main>
    );
  }

  const preview = await getPreview(id, user.id);
  if (!preview || preview.status !== "done") {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <p className="text-muted">Rapport indisponible.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 md:py-10 max-w-xl mx-auto">
      <h1 className="font-display text-2xl font-extrabold mb-5">Ton rapport est prêt</h1>
      <LockedReportPreview
        analysisId={id}
        pointsCount={preview.points_count!}
        premierPointLibelle={preview.premier_point_libelle!}
        blurredUrl={preview.blurred_url}
      />
    </main>
  );
}

function ImpactBadge({ impact }: { impact: "faible" | "moyen" | "fort" }) {
  const styles = {
    fort: "border-accent/30 text-accent",
    moyen: "border-line-strong text-muted",
    faible: "border-line text-dim",
  };
  return (
    <span className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded shrink-0 ${styles[impact]}`}>
      {impact}
    </span>
  );
}
