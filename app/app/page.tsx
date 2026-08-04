import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAnalysesList } from "@/lib/app/analyses";
import { DashboardBento } from "@/components/app/dashboard-bento";
import { AnalysisCard } from "@/components/app/analysis-card";
import { AppContainer } from "@/components/app/app-container";

export default async function AppPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done_at, is_admin, email")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_done_at) {
    redirect("/onboarding");
  }

  const isAdmin = profile.is_admin === true;
  const email = profile.email ?? user.email ?? "";
  const analyses = await getAnalysesList(user.id);
  const latest = analyses.find((a) => a.status === "done") ?? null;
  const history = analyses.filter((a) => a.id !== latest?.id);

  return (
    <AppContainer>
      <DashboardBento
        latest={latest}
        analysesCount={analyses.length}
        isAdmin={isAdmin}
        email={email}
      />

      {history.length > 0 && (
        <section className="mt-10 lg:mt-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.14em] text-dim mb-1">Historique</p>
              <h2 className="font-display text-xl font-extrabold">Analyses précédentes</h2>
            </div>
            <span className="font-mono text-[10px] text-dim uppercase border border-line rounded-full px-2.5 py-1">
              {history.length} analyse(s)
            </span>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {history.map((a) => (
              <li key={a.id}>
                <AnalysisCard analysis={a} isAdmin={isAdmin} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {analyses.length === 0 && (
        <p className="text-center text-sm text-dim mt-8">
          <Link href="/app/photo" className="text-accent underline">
            Ajouter une photo
          </Link>{" "}
          pour lancer ton analyse.
        </p>
      )}
    </AppContainer>
  );
}
