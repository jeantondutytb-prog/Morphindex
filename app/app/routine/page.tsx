import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoutinePanel } from "@/components/report/routine";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppCard, AppEmptyState, AppSectionLabel } from "@/components/app/ui";
import { getLatestAccessibleAnalysis } from "@/lib/app/analyses";

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

  const routine = analysis.routine as Parameters<typeof RoutinePanel>[0]["routine"];
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
        subtitle={`Plan d'action à partir du ${date} — semaines 1 à 4`}
        backHref={`/app/rapport/${analysis.id}`}
        backLabel="Rapport complet"
      />

      <AppCard className="p-6 lg:p-8">
        <AppSectionLabel>Instructions</AppSectionLabel>
        <p className="text-sm text-muted mb-8 max-w-2xl">
          Suis ces étapes dans l&apos;ordre. Les actifs forts s&apos;introduisent progressivement.
        </p>
        <div className="lg:columns-2 lg:gap-10 [&>*]:break-inside-avoid">
          <RoutinePanel routine={routine} />
        </div>
      </AppCard>
    </AppContainer>
  );
}
