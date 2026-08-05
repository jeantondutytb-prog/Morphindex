import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LockedReportPreview } from "@/components/report/locked-preview";
import { ScoresPanel } from "@/components/report/scores";
import { RoutinePanel } from "@/components/report/routine";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppCard, AppNavPill, AppSectionLabel } from "@/components/app/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DOMAINS } from "@/lib/ai/analysis-schema";
import { dimensionLabel, type DimensionScore } from "@/lib/ai/dimensions";
import { domainScoresFromStored, parseStoredDimensions } from "@/lib/ai/normalize-analysis";
import { parseRoutinePayload, fallbackRoutineResume, resolveWeekPlans } from "@/lib/routine/data";

type Point = {
  dimension?: string;
  axe?: string;
  libelle: string;
  impact: "faible" | "moyen" | "fort";
};
type Scores = Record<(typeof DOMAINS)[number], number>;

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
    const scores = domainScoresFromStored(analysis.scores) ?? (analysis.scores as Scores);
    const points = analysis.points as Point[];
    const dimensions = parseStoredDimensions(analysis);
    const routinePayload = parseRoutinePayload(analysis.routine);
    const routineResume =
      routinePayload.resume ??
      fallbackRoutineResume(
        Number(analysis.indice_actuel),
        Number(analysis.indice_atteignable),
        points,
      );
    const weekPlans = resolveWeekPlans(routinePayload);
    const date = new Date(analysis.created_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <AppContainer>
        <PageHeader
          kicker="Rapport"
          title="Ton rapport"
          subtitle={date}
          backHref="/app"
          backLabel="Dashboard"
        />

        {profile?.is_admin && !analysis.unlocked && (
          <span className="inline-flex font-mono text-[10px] uppercase text-accent border border-accent/25 bg-accent/8 px-2.5 py-1 rounded-full mb-4 -mt-2">
            Vue admin
          </span>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          <AppNavPill href="#scores">Scores</AppNavPill>
          <AppNavPill href="#points">Points</AppNavPill>
          <AppNavPill href="#routine">Routine</AppNavPill>
          <AppNavPill href="/app/routine" accent>Routine seule →</AppNavPill>
        </div>

        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8 lg:items-start stagger-in">
          <aside className="lg:sticky lg:top-20 space-y-5 mb-8 lg:mb-0">
            <AppCard accent className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-accent/10 blur-2xl" aria-hidden />
              <AppSectionLabel>Indice</AppSectionLabel>
              <div className="flex items-baseline gap-3 tnum mb-3 relative">
                <span className="font-display text-4xl lg:text-5xl font-extrabold text-num-idle tracking-[-.04em]">
                  {Number(analysis.indice_actuel).toFixed(1).replace(".", ",")}
                </span>
                <span className="text-xl text-dim">→</span>
                <span className="font-display text-4xl lg:text-5xl font-extrabold text-accent score-glow tracking-[-.04em]">
                  {Number(analysis.indice_atteignable).toFixed(1).replace(".", ",")}
                </span>
              </div>
              <p className="text-sm text-dim relative">
                Potentiel <strong className="text-muted">si tu suis la routine</strong> — aucun résultat garanti.
              </p>
            </AppCard>
            <section id="scores" className="scroll-mt-24">
              <ScoresPanel scores={scores} dimensions={dimensions} />
            </section>
          </aside>

          <div className="space-y-6">
            <section id="points" className="scroll-mt-24">
              <AppCard>
                <AppSectionLabel>Points d&apos;amélioration</AppSectionLabel>
                <h2 className="font-display font-bold text-lg mb-4 -mt-1">Ce qui compte le plus</h2>
                <ul className="space-y-3">
                  {points.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-line/80 bg-bg/30 px-4 py-3 text-sm lg:text-base">
                      <ImpactBadge impact={p.impact} />
                      <span className="min-w-0 flex-1">
                        <span className="text-muted">{p.libelle}</span>
                        {p.dimension && (
                          <span className="block mt-1 font-mono text-[9px] uppercase text-dim">
                            {dimensionLabel(p.dimension)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </AppCard>
            </section>

            <section id="routine" className="scroll-mt-24">
              <AppCard>
                <AppSectionLabel>Ta routine</AppSectionLabel>
                <h2 className="font-display font-bold text-lg mb-5 -mt-1">Semaines 1 à 4</h2>
                <RoutinePanel
                  routine={routinePayload.items}
                  weekPlans={weekPlans}
                  resume={routineResume}
                />
              </AppCard>
            </section>
          </div>
        </div>
      </AppContainer>
    );
  }

  const preview = await getPreview(id, user.id);
  if (!preview || preview.status !== "done") {
    return (
      <AppContainer narrow>
        <AppCard className="p-10 text-center">
          <p className="text-muted">Rapport indisponible.</p>
        </AppCard>
      </AppContainer>
    );
  }

  return (
    <AppContainer narrow>
      <PageHeader
        kicker="Rapport"
        title="Ton rapport est prêt"
        subtitle="Débloque pour voir ton indice complet et ta routine."
        backHref="/app"
        backLabel="Dashboard"
      />
      <LockedReportPreview
        analysisId={id}
        pointsCount={preview.points_count!}
        premierPointLibelle={preview.premier_point_libelle!}
        blurredUrl={preview.blurred_url}
      />
    </AppContainer>
  );
}

function ImpactBadge({ impact }: { impact: "faible" | "moyen" | "fort" }) {
  const styles = {
    fort: "border-accent/30 text-accent bg-accent/8",
    moyen: "border-line-strong text-muted bg-bg/40",
    faible: "border-line text-dim bg-bg/20",
  };
  return (
    <span className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded-full shrink-0 ${styles[impact]}`}>
      {impact}
    </span>
  );
}
