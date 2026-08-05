import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoutineTracker } from "@/components/report/routine-tracker";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppCard, AppEmptyState, AppSectionLabel } from "@/components/app/ui";
import { getLatestAccessibleAnalysis } from "@/lib/app/analyses";
import { parseRoutinePayload, fallbackRoutineResume, resolveWeekPlans } from "@/lib/routine/data";

export default async function RoutinePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const analysis = await getLatestAccessibleAnalysis(user.id, isAdmin);

  if (!analysis?.routine) {
    return (
      <AppContainer narrow>
        <PageHeader
          kicker="Routine"
          title="Ma routine"
          subtitle="Aucune routine disponible pour l'instant."
          backHref="/app"
          backLabel="Dashboard"
        />
        <AppEmptyState
          title="Pas encore de routine"
          description="Débloque un rapport ou lance une analyse pour obtenir ta routine personnalisée."
          actionHref="/app/photo"
          actionLabel="Lancer une analyse"
        />
      </AppContainer>
    );
  }

  const payload = parseRoutinePayload(analysis.routine);
  if (payload.items.length === 0) {
    return (
      <AppContainer narrow>
        <PageHeader
          kicker="Routine"
          title="Ma routine"
          subtitle="Aucune routine disponible pour l'instant."
          backHref="/app"
          backLabel="Dashboard"
        />
        <AppEmptyState
          title="Pas encore de routine"
          description="Débloque un rapport ou lance une analyse pour obtenir ta routine personnalisée."
          actionHref="/app/photo"
          actionLabel="Lancer une analyse"
        />
      </AppContainer>
    );
  }

  const resume =
    payload.resume ??
    fallbackRoutineResume(
      Number(analysis.indice_actuel),
      Number(analysis.indice_atteignable),
      (analysis.points as { axe: string }[]) ?? [],
    );
  const weekPlans = resolveWeekPlans(payload);
  const date = new Date(analysis.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppContainer>
      <PageHeader
        kicker="Routine"
        title="Ma routine"
        subtitle={`Plan 4 semaines · démarré le ${date}`}
        backHref={`/app/rapport/${analysis.id}`}
        backLabel="Rapport complet"
      />

      <AppCard className="p-5 lg:p-8">
        <AppSectionLabel>Ton plan semaine par semaine</AppSectionLabel>
        <p className="text-sm text-muted mb-6 max-w-xl">
          Un jour à la fois. Chaque action est liée à ton analyse — objectif, détail et pourquoi inclus.
        </p>
        <RoutineTracker
          analysisId={analysis.id}
          routine={payload.items}
          startDate={analysis.created_at}
          weekPlans={weekPlans}
          resume={resume}
        />
      </AppCard>
    </AppContainer>
  );
}
