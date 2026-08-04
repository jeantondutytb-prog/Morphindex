import Link from "next/link";
import type { AnalysisListItem } from "@/lib/app/analyses";
import { StatCard } from "@/components/app/stat-card";

export function DashboardBento({
  latest,
  analysesCount,
  isAdmin,
  email,
}: {
  latest: AnalysisListItem | null;
  analysesCount: number;
  isAdmin: boolean;
  email: string;
}) {
  const accessible = latest && (latest.unlocked || isAdmin) && latest.status === "done";
  const firstName = email.split("@")[0]?.split(".")[0] ?? "toi";
  const greeting = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const indiceActuel = latest?.indice_actuel != null ? Number(latest.indice_actuel) : null;
  const indiceAtteignable = latest?.indice_atteignable != null ? Number(latest.indice_atteignable) : null;
  const gap = indiceActuel != null && indiceAtteignable != null
    ? (indiceAtteignable - indiceActuel).toFixed(1).replace(".", ",")
    : null;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-1">Dashboard</p>
        <h1 className="font-display text-2xl lg:text-3xl font-extrabold">
          Bonjour {greeting}
        </h1>
        <p className="text-sm text-muted mt-1">Voici où tu en es sur ton parcours softmaxing.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Analyses" value={String(analysesCount)} hint="Total réalisées" />
        <StatCard
          label="Indice actuel"
          value={indiceActuel != null ? indiceActuel.toFixed(1).replace(".", ",") : "—"}
          hint={accessible ? "Dernière mesure" : "Débloque ton rapport"}
        />
        <StatCard
          label="Potentiel"
          value={indiceAtteignable != null ? indiceAtteignable.toFixed(1).replace(".", ",") : "—"}
          hint={gap ? `+${gap} pts possibles` : "Routine personnalisée"}
          accent
        />
        <StatCard
          label="Points clés"
          value={latest?.points_count != null ? String(latest.points_count) : "—"}
          hint="Axes d'amélioration"
        />
      </div>

      {!latest || latest.status !== "done" ? (
        <section className="rounded-2xl border border-line bg-surface p-8 lg:p-12 text-center">
          <p className="font-display text-xl lg:text-2xl font-extrabold mb-2">Lance ta première analyse</p>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Photo, 7 axes, indice et routine personnalisée — livraison en quelques minutes.
          </p>
          <Link
            href="/app/photo"
            className="inline-block rounded-xl bg-accent px-8 py-3.5 font-bold text-accent-ink hover:brightness-110 transition"
          >
            Commencer →
          </Link>
        </section>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Carte principale — indice */}
          <section className="lg:col-span-2 rounded-2xl border border-accent/20 bg-gradient-to-br from-surface via-surface to-accent/5 p-6 lg:p-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-4">Dernière analyse</p>
            {accessible && indiceActuel != null ? (
              <div className="flex items-baseline gap-4 tnum mb-4">
                <span className="font-display text-5xl lg:text-7xl font-extrabold text-num-idle">
                  {indiceActuel.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-2xl lg:text-3xl text-dim">→</span>
                <span className="font-display text-5xl lg:text-7xl font-extrabold text-accent">
                  {indiceAtteignable!.toFixed(1).replace(".", ",")}
                </span>
              </div>
            ) : (
              <p className="text-lg text-muted mb-4 line-clamp-3">{latest.premier_point_libelle}</p>
            )}
            <p className="text-sm text-dim mb-6">
              {accessible
                ? "Indice actuel → atteignable si tu suis la routine."
                : `${latest.points_count} points identifiés — débloque pour voir le détail.`}
            </p>
            <Link
              href={`/app/rapport/${latest.id}`}
              className="inline-flex rounded-xl bg-accent px-6 py-3 font-bold text-accent-ink hover:brightness-110 transition"
            >
              {accessible ? "Voir le rapport →" : "Débloquer le rapport →"}
            </Link>
          </section>

          {/* Actions rapides */}
          <section className="rounded-2xl border border-line bg-surface p-6 lg:p-8 flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-1">Actions</p>
            {accessible && (
              <Link
                href="/app/routine"
                className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5 text-sm hover:border-accent/30 transition group"
              >
                <span className="text-text font-medium">Ma routine</span>
                <span className="text-dim group-hover:text-accent transition">→</span>
              </Link>
            )}
            <Link
              href="/app/photo"
              className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5 text-sm hover:border-accent/30 transition group"
            >
              <span className="text-text font-medium">Nouvelle analyse</span>
              <span className="text-dim group-hover:text-accent transition">→</span>
            </Link>
            <Link
              href="/app/compte"
              className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5 text-sm hover:border-accent/30 transition group"
            >
              <span className="text-text font-medium">Mon abonnement</span>
              <span className="text-dim group-hover:text-accent transition">→</span>
            </Link>
            {isAdmin && (
              <Link
                href="/app/admin"
                className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 text-sm hover:border-accent/40 transition group"
              >
                <span className="text-accent font-medium">Admin</span>
                <span className="text-accent/60 group-hover:text-accent transition">→</span>
              </Link>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
