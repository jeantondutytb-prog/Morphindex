import Link from "next/link";
import type { AnalysisListItem } from "@/lib/app/analyses";

export function DashboardHero({
  latest,
  isAdmin,
}: {
  latest: AnalysisListItem | null;
  isAdmin: boolean;
}) {
  const accessible = latest && (latest.unlocked || isAdmin) && latest.status === "done";

  if (!latest || latest.status !== "done") {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">Bienvenue</p>
        <h2 className="font-display text-xl font-extrabold mb-2">Lance ta première analyse</h2>
        <p className="text-sm text-muted mb-5">
          Photo, 7 axes, indice et routine personnalisée — livraison en quelques minutes.
        </p>
        <Link
          href="/onboarding/photo"
          className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-accent-ink hover:brightness-110 transition"
        >
          Commencer
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-accent/20 bg-surface p-6 mb-8">
      <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">Dernière analyse</p>

      {accessible && latest.indice_actuel != null ? (
        <div className="flex items-baseline gap-3 tnum mb-4">
          <span className="font-display text-4xl font-extrabold text-num-idle">
            {Number(latest.indice_actuel).toFixed(1).replace(".", ",")}
          </span>
          <span className="text-xl text-dim">→</span>
          <span className="font-display text-4xl font-extrabold text-accent">
            {Number(latest.indice_atteignable).toFixed(1).replace(".", ",")}
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted mb-4 line-clamp-2">{latest.premier_point_libelle}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/app/rapport/${latest.id}`}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:brightness-110 transition"
        >
          {accessible ? "Voir le rapport" : "Débloquer le rapport"}
        </Link>
        {accessible && (
          <Link
            href="/app/routine"
            className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:border-accent/30 transition"
          >
            Ma routine
          </Link>
        )}
        <Link
          href="/onboarding/photo"
          className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:border-accent/30 transition"
        >
          Nouvelle analyse
        </Link>
      </div>
    </section>
  );
}
