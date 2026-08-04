type RoutineItem = {
  moment: "matin" | "soir" | "hebdo";
  action: string;
  produit: string | null;
  frequence: string;
  semaine_debut: number;
};

const MOMENT_LABELS = { matin: "Matin", soir: "Soir", hebdo: "Hebdomadaire" } as const;

export function RoutinePanel({ routine }: { routine: RoutineItem[] }) {
  const sorted = [...routine].sort((a, b) => a.semaine_debut - b.semaine_debut);
  const byMoment = (["matin", "soir", "hebdo"] as const).map((m) => ({
    moment: m,
    items: sorted.filter((r) => r.moment === m),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {byMoment.map(({ moment, items }) => (
        <div key={moment}>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">
            {MOMENT_LABELS[moment]}
          </h3>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-muted border-l-2 border-line pl-3">
                <span className="text-text">{item.action}</span>
                {item.produit && <span className="text-dim"> · {item.produit}</span>}
                <span className="text-dim"> · {item.frequence} · sem. {item.semaine_debut}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
