import type { RoutineItem } from "@/lib/routine/schedule";
import { itemsForWeek, ROUTINE_WEEKS } from "@/lib/routine/schedule";

const MOMENT_LABELS = { matin: "Matin", soir: "Soir", hebdo: "Hebdomadaire" } as const;

/** Vue résumée pour le rapport — détail complet sur /app/routine */
export function RoutinePanel({ routine }: { routine: RoutineItem[] }) {
  return (
    <div className="space-y-4">
      {ROUTINE_WEEKS.map((week) => {
        const items = itemsForWeek(routine, week).filter((item) => item.semaine_debut === week);
        if (items.length === 0) return null;

        return (
          <div key={week} className="rounded-xl border border-line bg-bg/30 p-4">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-accent mb-3">
              Semaine {week}
            </h3>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-dim shrink-0">{MOMENT_LABELS[item.moment]}</span>
                  <span>
                    <span className="text-text">{item.action}</span>
                    {item.produit && <span className="text-dim"> · {item.produit}</span>}
                    <span className="text-dim"> · {item.frequence}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
