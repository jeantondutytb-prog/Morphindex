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
      <section className="rounded-2xl border border-line bg-surface p-6 lg:p-10 mb-8 lg:mb-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">Bienvenue</p>
        <h2 className="font-display text-xl lg:text-2xl font-extrabold mb-2">Lance ta première analyse</h2>
        <p className="text-sm lg:text-base text-muted mb-6 max-w-lg">
          Photo, 7 axes, indice et routine personnalisée — livraison en quelques minutes.
        </p>
        <Link
          href="/onboarding/photo"
          className="inline-block rounded-lg bg-accent px-8 py-3.5 font-bold text-accent-ink hover:brightness-110 transition"
        >
          Commencer
        </Link>
      </section>
    );
  }

  return (
      <section className="rounded-xl border border-line bg-surface p-5 lg:p-6 h-full">
      <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-4">Dernière analyse</p>

      <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
        <div className="mb-6 lg:mb-0">
          {accessible && latest.indice_actuel != null ? (
            <div className="flex items-baseline gap-4 tnum">
              <span className="font-display text-5xl lg:text-6xl font-extrabold text-num-idle">
                {Number(latest.indice_actuel).toFixed(1).replace(".", ",")}
              </span>
              <span className="text-2xl lg:text-3xl text-dim">→</span>
              <span className="font-display text-5xl lg:text-6xl font-extrabold text-accent">
                {Number(latest.indice_atteignable).toFixed(1).replace(".", ",")}
              </span>
            </div>
          ) : (
            <p className="text-base lg:text-lg text-muted max-w-xl">{latest.premier_point_libelle}</p>
          )}
          <p className="text-sm text-dim mt-3">Indice actuel → atteignable</p>
        </div>

        <div className="flex flex-wrap lg:flex-col gap-3 lg:min-w-[220px]">
          <Link
            href={`/app/rapport/${latest.id}`}
            className="rounded-lg bg-accent px-6 py-3 text-sm lg:text-base font-bold text-accent-ink hover:brightness-110 transition text-center"
          >
            {accessible ? "Voir le rapport" : "Débloquer le rapport"}
          </Link>
          {accessible && (
            <Link
              href="/app/routine"
              className="rounded-lg border border-line px-6 py-3 text-sm lg:text-base text-muted hover:border-accent/30 transition text-center"
            >
              Ma routine
            </Link>
          )}
          <Link
            href="/onboarding/photo"
            className="rounded-lg border border-line px-6 py-3 text-sm lg:text-base text-muted hover:border-accent/30 transition text-center"
          >
            Nouvelle analyse
          </Link>
        </div>
      </div>
    </section>
  );
}
