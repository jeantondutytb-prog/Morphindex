import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAnalysesList } from "@/lib/app/analyses";
import { DashboardHero } from "@/components/app/dashboard-hero";
import { AnalysisCard } from "@/components/app/analysis-card";
import { PageHeader } from "@/components/app/page-header";

export default async function AppPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done_at, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_done_at) {
    redirect("/onboarding");
  }

  const isAdmin = profile.is_admin === true;
  const analyses = await getAnalysesList(user.id);
  const latest = analyses.find((a) => a.status === "done") ?? null;
  const history = analyses.filter((a) => a.id !== latest?.id);

  return (
    <div className="px-5 py-10 max-w-2xl mx-auto">
      <PageHeader title="Mes analyses" subtitle="Historique et accès à tes rapports" />

      <DashboardHero latest={latest} isAdmin={isAdmin} />

      {history.length > 0 && (
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">
            Historique
          </h2>
          <ul className="space-y-3">
            {history.map((a) => (
              <li key={a.id}>
                <AnalysisCard analysis={a} isAdmin={isAdmin} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {analyses.length === 0 && (
        <p className="text-center text-sm text-dim mt-4">
          <Link href="/onboarding/photo" className="text-accent underline">
            Ajouter une photo
          </Link>{" "}
          pour lancer ton analyse.
        </p>
      )}
    </div>
  );
}
