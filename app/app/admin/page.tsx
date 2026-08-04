import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/app/page-header";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/app");

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
    <div className="px-5 py-10 max-w-2xl mx-auto">
      <PageHeader title="Vue d'ensemble" subtitle="Admin MorphIndex" backHref="/app" />

      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: "Utilisateurs", value: usersCount ?? 0 },
          { label: "Analyses", value: analysesCount ?? 0 },
          { label: "Rapports débloqués", value: unlockedCount ?? 0 },
          { label: "Abos actifs", value: activeSubsCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-mono text-[10px] text-dim uppercase">{label}</p>
            <p className="font-display text-3xl font-extrabold tnum mt-1">{value}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="font-display font-bold mb-3">Dernières analyses</h2>
        <ul className="rounded-xl border border-line bg-surface divide-y divide-line">
          {(recentAnalyses ?? []).length === 0 && (
            <li className="p-4 text-sm text-dim">Aucune analyse.</li>
          )}
          {(recentAnalyses ?? []).map((a) => (
              <li key={a.id} className="p-4 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-muted font-mono text-xs truncate">{a.user_id.slice(0, 8)}…</p>
                  <p className="text-dim text-xs">
                    {new Date(a.created_at).toLocaleString("fr-FR")} · {a.status}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase text-dim shrink-0">
                  {a.unlocked ? "débloqué" : "flouté"}
                </span>
              </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display font-bold mb-3">Événements récents</h2>
        <ul className="rounded-xl border border-line bg-surface divide-y divide-line">
          {(recentEvents ?? []).map((e, i) => (
            <li key={i} className="px-4 py-3 flex justify-between gap-3 text-sm">
              <span className="font-mono text-xs text-accent">{e.type}</span>
              <span className="text-dim text-xs shrink-0">
                {new Date(e.created_at).toLocaleString("fr-FR")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
