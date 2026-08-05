import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoutineTracker } from "@/components/report/routine-tracker";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppCard, AppEmptyState, AppSectionLabel } from "@/components/app/ui";
import { getLatestAccessibleAnalysis } from "@/lib/app/analyses";
import type { RoutineItem } from "@/lib/routine/schedule";

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

  const routine = analysis.routine as RoutineItem[];
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
          Un jour à la fois. Coche tout pour débloquer le lendemain.
        </p>
        <RoutineTracker
          analysisId={analysis.id}
          routine={routine}
          startDate={analysis.created_at}
        />
      </AppCard>
    </AppContainer>
  );
}
