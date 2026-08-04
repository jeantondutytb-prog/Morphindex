import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("onboarding_done_at").eq("id", user.id).single();

  if (!profile?.onboarding_done_at) {
    redirect("/onboarding");
  }

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, status, indice_actuel, indice_atteignable, created_at, unlocked")
    .order("created_at", { ascending: false });

  return (
    <div className="px-5 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-extrabold mb-6">Mes analyses</h1>

      {(!analyses || analyses.length === 0) && (
        <div className="rounded-xl border border-line bg-surface p-6 text-center">
          <p className="text-muted mb-4">Aucune analyse pour l&apos;instant.</p>
          <Link
            href="/onboarding/photo"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-accent-ink"
          >
            Lancer mon analyse
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {analyses?.map((a) => (
          <li key={a.id}>
            <Link
              href={`/app/rapport/${a.id}`}
              className="block rounded-xl border border-line bg-surface p-4 hover:border-accent/30 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </span>
                <span className="font-mono text-[10px] uppercase text-dim">
                  {a.unlocked ? "débloqué" : "flouté"}
                </span>
              </div>
              {a.unlocked && a.indice_actuel != null && (
                <p className="mt-2 tnum font-display font-bold">
                  {Number(a.indice_actuel).toFixed(1).replace(".", ",")}
                  {" → "}
                  <span className="text-accent">
                    {Number(a.indice_atteignable).toFixed(1).replace(".", ",")}
                  </span>
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link href="/onboarding/photo" className="text-sm text-accent underline">
          Nouvelle analyse
        </Link>
      </div>
    </div>
  );
}
