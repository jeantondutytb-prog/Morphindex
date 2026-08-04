import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LockedReportPreview } from "@/components/report/locked-preview";
import { ScoresPanel } from "@/components/report/scores";
import { RoutinePanel } from "@/components/report/routine";
import { PageHeader } from "@/components/app/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const adminDb = createAdminClient();

  let analysis;
  if (profile?.is_admin) {
    const { data } = await adminDb.from("analyses").select("*").eq("id", id).eq("user_id", user.id).single();
    analysis = data;
  } else {
    const { data } = await supabase.from("analyses").select("*").eq("id", id).single();
    analysis = data;
  }

  const showFull = analysis?.unlocked || profile?.is_admin;

  if (analysis && showFull && analysis.status === "done") {
    const scores = analysis.scores as Scores;
    const points = analysis.points as Point[];
    const routine = analysis.routine as Parameters<typeof RoutinePanel>[0]["routine"];
    const date = new Date(analysis.created_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="px-5 py-10 max-w-2xl mx-auto">
        <PageHeader
          title="Ton rapport"
          subtitle={date}
          backHref="/app"
          backLabel="Mes analyses"
        />

        {profile?.is_admin && !analysis.unlocked && (
          <p className="font-mono text-[10px] uppercase text-accent mb-4 -mt-4">Vue admin</p>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          <a href="#scores" className="text-xs text-dim hover:text-muted border border-line rounded-lg px-3 py-1.5 transition">
            Scores
          </a>
          <a href="#points" className="text-xs text-dim hover:text-muted border border-line rounded-lg px-3 py-1.5 transition">
            Points
          </a>
          <a href="#routine" className="text-xs text-dim hover:text-muted border border-line rounded-lg px-3 py-1.5 transition">
            Routine
          </a>
          <Link href="/app/routine" className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/5 transition">
            Routine seule →
          </Link>
        </div>

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

        <section id="scores" className="mb-8 scroll-mt-20">
          <h2 className="font-display font-bold mb-4">Sous-scores</h2>
          <ScoresPanel scores={scores} />
        </section>

        <section id="points" className="mb-8 scroll-mt-20">
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

        <section id="routine" className="scroll-mt-20">
          <h2 className="font-display font-bold mb-4">Ta routine</h2>
          <RoutinePanel routine={routine} />
        </section>
      </div>
    );
  }

  const preview = await getPreview(id, user.id);
  if (!preview || preview.status !== "done") {
    return (
      <div className="flex items-center justify-center px-5 py-20">
        <p className="text-muted">Rapport indisponible.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:py-10 max-w-xl mx-auto">
      <PageHeader
        title="Ton rapport est prêt"
        backHref="/app"
        backLabel="Mes analyses"
      />
      <LockedReportPreview
        analysisId={id}
        pointsCount={preview.points_count!}
        premierPointLibelle={preview.premier_point_libelle!}
        blurredUrl={preview.blurred_url}
      />
    </div>
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
