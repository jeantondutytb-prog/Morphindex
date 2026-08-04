import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RoutinePanel } from "@/components/report/routine";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
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
          title="Ma routine"
          subtitle="Aucune routine disponible pour l'instant."
          backHref="/app"
          backLabel="Mes analyses"
        />
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-muted mb-4">
            Débloque un rapport ou lance une analyse pour obtenir ta routine personnalisée.
          </p>
          <Link
            href="/app/photo"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-accent-ink"
          >
            Lancer une analyse
          </Link>
        </div>
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
        title="Ma routine"
        subtitle={`Plan d'action à partir du ${date} — semaines 1 à 4`}
        backHref={`/app/rapport/${analysis.id}`}
        backLabel="Rapport complet"
      />

      <section className="rounded-xl border border-line bg-surface p-6 lg:p-8">
        <p className="text-sm text-dim mb-8 max-w-2xl">
          Suis ces étapes dans l&apos;ordre. Les actifs forts s&apos;introduisent progressivement.
        </p>
        <div className="lg:columns-2 lg:gap-10 [&>*]:break-inside-avoid">
          <RoutinePanel routine={routine} />
        </div>
      </section>
    </AppContainer>
  );
}
