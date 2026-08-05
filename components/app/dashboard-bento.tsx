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
    <div className="space-y-6 lg:space-y-8 relative">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-dim mb-2">Dashboard</p>
        <h1 className="font-display text-2xl lg:text-[34px] font-extrabold tracking-[-.03em]">
          Bonjour {greeting}
        </h1>
        <p className="text-sm text-muted mt-2">Voici où tu en es sur ton parcours softmaxing.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger-in">
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
        <section className="rounded-2xl border border-line bg-surface/80 backdrop-blur-sm p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <p className="font-display text-xl lg:text-2xl font-extrabold mb-2">Lance ta première analyse</p>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Photo, 90 dimensions, indice et routine personnalisée — livraison en quelques minutes.
            </p>
            <Link
              href="/app/photo"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-bold text-accent-ink hover:brightness-110 transition cta-shine overflow-hidden"
            >
              Commencer <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 stagger-in">
          <section className="lg:col-span-2 rounded-2xl border border-accent/20 bg-gradient-to-br from-surface via-surface to-accent/5 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-accent/8 blur-3xl" aria-hidden />
            <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-4 relative">Dernière analyse</p>
            {accessible && indiceActuel != null ? (
              <div className="flex items-baseline gap-4 tnum mb-4 relative">
                <span className="font-display text-5xl lg:text-7xl font-extrabold text-num-idle tracking-[-.04em]">
                  {indiceActuel.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-2xl lg:text-3xl text-dim">→</span>
                <span className="font-display text-5xl lg:text-7xl font-extrabold text-accent score-glow tracking-[-.04em]">
                  {indiceAtteignable!.toFixed(1).replace(".", ",")}
                </span>
              </div>
            ) : (
              <p className="text-lg text-muted mb-4 line-clamp-3 relative">{latest.premier_point_libelle}</p>
            )}
            <p className="text-sm text-dim mb-6 relative">
              {accessible
                ? "Indice actuel → atteignable si tu suis la routine."
                : `${latest.points_count} points identifiés — débloque pour voir le détail.`}
            </p>
            <Link
              href={`/app/rapport/${latest.id}`}
              className="relative inline-flex rounded-xl bg-accent px-6 py-3 font-bold text-accent-ink hover:brightness-110 transition cta-shine overflow-hidden"
            >
              {accessible ? "Voir le rapport →" : "Débloquer le rapport →"}
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 lg:p-8 flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">Actions</p>
            {accessible && (
              <ActionLink href="/app/routine" label="Ma routine" />
            )}
            <ActionLink href="/app/photo" label="Nouvelle analyse" />
            <ActionLink href="/app/compte" label="Mon abonnement" />
            {isAdmin && (
              <Link
                href="/app/admin"
                className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 text-sm hover:border-accent/40 transition group mt-1"
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

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5 text-sm hover:border-accent/30 hover:bg-accent/[0.02] transition group"
    >
      <span className="text-text font-medium">{label}</span>
      <span className="text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all">→</span>
    </Link>
  );
}
