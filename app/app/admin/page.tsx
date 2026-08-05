import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppCard, AppSectionLabel } from "@/components/app/ui";
import { StatCard } from "@/components/app/stat-card";

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { count: usersCount },
    { count: analysesCount },
    { count: unlockedCount },
    { count: activeSubsCount },
    { data: recentEvents },
    { data: recentAnalyses },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }).eq("unlocked", true),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("events").select("type, created_at, user_id").order("created_at", { ascending: false }).limit(15),
    admin
      .from("analyses")
      .select("id, status, unlocked, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <AppContainer>
      <PageHeader kicker="Admin" title="Vue d'ensemble" subtitle="Admin MorphIndex" backHref="/app" backLabel="Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8 stagger-in">
        <StatCard label="Utilisateurs" value={String(usersCount ?? 0)} />
        <StatCard label="Analyses" value={String(analysesCount ?? 0)} />
        <StatCard label="Rapports débloqués" value={String(unlockedCount ?? 0)} accent />
        <StatCard label="Abos actifs" value={String(activeSubsCount ?? 0)} />
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 stagger-in">
        <section>
          <AppSectionLabel>Dernières analyses</AppSectionLabel>
          <AppCard padding="none" className="overflow-hidden">
            <ul className="divide-y divide-line">
              {(recentAnalyses ?? []).length === 0 && (
                <li className="p-5 text-sm text-dim">Aucune analyse.</li>
              )}
              {(recentAnalyses ?? []).map((a) => (
                <li key={a.id} className="p-4 flex items-center justify-between gap-3 text-sm hover:bg-bg/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-muted font-mono text-xs truncate">{a.user_id.slice(0, 8)}…</p>
                    <p className="text-dim text-xs">
                      {new Date(a.created_at).toLocaleString("fr-FR")} · {a.status}
                    </p>
                  </div>
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                    a.unlocked ? "border-accent/30 text-accent bg-accent/8" : "border-line text-dim"
                  }`}>
                    {a.unlocked ? "débloqué" : "flouté"}
                  </span>
                </li>
              ))}
            </ul>
          </AppCard>
        </section>

        <section>
          <AppSectionLabel>Événements récents</AppSectionLabel>
          <AppCard padding="none" className="overflow-hidden">
            <ul className="divide-y divide-line">
              {(recentEvents ?? []).map((e, i) => (
                <li key={i} className="px-4 py-3 flex justify-between gap-3 text-sm hover:bg-bg/30 transition-colors">
                  <span className="font-mono text-xs text-accent">{e.type}</span>
                  <span className="text-dim text-xs shrink-0">
                    {new Date(e.created_at).toLocaleString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          </AppCard>
        </section>
      </div>
    </AppContainer>
  );
}
