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
      className="block rounded-2xl border border-line bg-surface p-5 lg:p-6 hover:border-accent/30 hover:shadow-[0_0_0_1px_rgba(0,229,160,.08)] transition group"
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
        <p className="tnum font-display text-xl font-bold mb-2">
          {Number(analysis.indice_actuel).toFixed(1).replace(".", ",")}
          <span className="text-dim font-normal mx-1">→</span>
          <span className="text-accent">
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
        <p className="mt-3 text-xs text-accent opacity-0 group-hover:opacity-100 transition">
          {accessible ? "Voir le rapport →" : "Débloquer →"}
        </p>
      )}
    </Link>
  );
}

function StatusBadge({ unlocked, pending }: { unlocked: boolean; pending: boolean }) {
  if (pending) {
    return (
      <span className="font-mono text-[9px] uppercase tracking-wider border border-line text-dim px-2 py-0.5 rounded shrink-0">
        en cours
      </span>
    );
  }
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded shrink-0 ${
        unlocked ? "border-accent/30 text-accent" : "border-line-strong text-dim"
      }`}
    >
      {unlocked ? "débloqué" : "verrouillé"}
    </span>
  );
}
