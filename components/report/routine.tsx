type RoutineItem = {
  moment: "matin" | "soir" | "hebdo";
  action: string;
  produit: string | null;
  frequence: string;
  semaine_debut: number;
};

const MOMENT_LABELS = { matin: "Matin", soir: "Soir", hebdo: "Hebdomadaire" } as const;

const MOMENT_ICONS = {
  matin: "☀",
  soir: "☾",
  hebdo: "◷",
} as const;

export function RoutinePanel({ routine }: { routine: RoutineItem[] }) {
  const sorted = [...routine].sort((a, b) => a.semaine_debut - b.semaine_debut);
  const byMoment = (["matin", "soir", "hebdo"] as const).map((m) => ({
    moment: m,
    items: sorted.filter((r) => r.moment === m),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {byMoment.map(({ moment, items }) => (
        <div key={moment} className="rounded-xl border border-line bg-bg/30 p-4 lg:p-5">
          <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim mb-4">
            <span className="flex size-6 items-center justify-center rounded-lg border border-line bg-surface text-xs">
              {MOMENT_ICONS[moment]}
            </span>
            {MOMENT_LABELS[moment]}
          </h3>
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-[10px] font-mono mt-0.5">
                  {item.semaine_debut}
                </span>
                <div>
                  <span className="text-text font-medium">{item.action}</span>
                  {item.produit && <span className="text-dim"> · {item.produit}</span>}
                  <p className="text-dim text-xs mt-0.5">{item.frequence}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
