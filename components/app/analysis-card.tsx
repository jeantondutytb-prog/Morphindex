import Link from "next/link";
import type { AnalysisListItem } from "@/lib/app/analyses";

export function AnalysisCard({ analysis, isAdmin }: { analysis: AnalysisListItem; isAdmin?: boolean }) {
  const accessible = Boolean(analysis.unlocked || isAdmin);
  const date = new Date(analysis.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/app/rapport/${analysis.id}`}
      className="block rounded-2xl border border-line bg-surface p-5 lg:p-6 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.2)] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm text-muted">{date}</p>
          {analysis.status === "failed" && (
            <p className="text-xs text-dim mt-0.5">Analyse échouée</p>
          )}
        </div>
        <StatusBadge unlocked={accessible} pending={analysis.status === "pending"} />
      </div>

      {accessible && analysis.indice_actuel != null && analysis.status === "done" && (
        <p className="tnum font-display text-2xl font-extrabold mb-2 tracking-[-.02em]">
          {Number(analysis.indice_actuel).toFixed(1).replace(".", ",")}
          <span className="text-dim font-normal mx-1.5 text-lg">→</span>
          <span className="text-accent score-glow">
            {Number(analysis.indice_atteignable).toFixed(1).replace(".", ",")}
          </span>
        </p>
      )}

      {!accessible && analysis.status === "done" && analysis.premier_point_libelle && (
        <>
          <p className="font-mono text-[10px] uppercase text-dim mb-1">
            {analysis.points_count} points identifiés
          </p>
          <p className="text-sm text-muted line-clamp-2">{analysis.premier_point_libelle}</p>
        </>
      )}

      {analysis.status === "done" && (
        <p className="mt-4 inline-flex items-center gap-1 text-xs text-accent opacity-70 group-hover:opacity-100 transition">
          {accessible ? "Voir le rapport" : "Débloquer"}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </p>
      )}
    </Link>
  );
}

function StatusBadge({ unlocked, pending }: { unlocked: boolean; pending: boolean }) {
  if (pending) {
    return (
      <span className="font-mono text-[9px] uppercase tracking-wider border border-line text-dim px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-dim animate-pulse" />
        en cours
      </span>
    );
  }
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded-full shrink-0 ${
        unlocked ? "border-accent/30 text-accent bg-accent/8" : "border-line-strong text-dim"
      }`}
    >
      {unlocked ? "débloqué" : "verrouillé"}
    </span>
  );
}
