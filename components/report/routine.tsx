import type { RoutineItem } from "@/lib/routine/schedule";
import { itemsForWeek, ROUTINE_WEEKS } from "@/lib/routine/schedule";
import { AXE_LABELS, resolveWeekPlans, type RoutineResume, type WeekPlan } from "@/lib/routine/data";
import { dimensionLabel, DOMAIN_LABELS } from "@/lib/ai/dimensions";

const MOMENT_LABELS = { matin: "Matin", soir: "Soir", hebdo: "Hebdomadaire" } as const;

/** Vue résumée pour le rapport — détail complet sur /app/routine */
export function RoutinePanel({
  routine,
  weekPlans,
  resume,
}: {
  routine: RoutineItem[];
  weekPlans?: WeekPlan[] | null;
  resume?: RoutineResume | null;
}) {
  const plans = weekPlans?.length === 4
    ? weekPlans
    : resolveWeekPlans({ items: routine, plan_semaines: weekPlans ?? null, resume: resume ?? null });

  return (
    <div className="space-y-5">
      {resume && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent mb-2">
            Vision 4 semaines
          </p>
          <p className="text-sm text-muted leading-relaxed">{resume.vision}</p>
        </div>
      )}

      {ROUTINE_WEEKS.map((week) => {
        const plan = plans.find((p) => p.semaine === week);
        const items = itemsForWeek(routine, week).filter((item) => item.semaine_debut === week);
        if (!plan && items.length === 0) return null;

        return (
          <div key={week} className="rounded-xl border border-line bg-bg/30 p-4">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-accent mb-1">
              Semaine {week}
            </h3>
            {plan && (
              <>
                <p className="font-display font-bold text-text mb-1">{plan.titre}</p>
                <p className="text-sm text-muted mb-3 leading-relaxed">{plan.objectif}</p>
              </>
            )}
            {items.length > 0 && (
              <ul className="space-y-3 border-t border-line/60 pt-3">
                {items.map((item, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex gap-2 text-muted">
                      <span className="text-dim shrink-0 w-20">{MOMENT_LABELS[item.moment]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="text-text font-medium">{item.action}</span>
                        {item.produit && <span className="text-dim"> · {item.produit}</span>}
                        <span className="text-dim"> · {item.frequence}</span>
                        {item.dimension && (
                          <span className="ml-2 font-mono text-[8px] uppercase text-dim border border-line px-1.5 py-0.5 rounded">
                            {dimensionLabel(item.dimension)}
                          </span>
                        )}
                        {!item.dimension && item.axe && (
                          <span className="ml-2 font-mono text-[8px] uppercase text-dim border border-line px-1.5 py-0.5 rounded">
                            {DOMAIN_LABELS[item.axe as keyof typeof DOMAIN_LABELS] ?? item.axe}
                          </span>
                        )}
                        {item.detail && (
                          <span className="block text-muted mt-1 leading-relaxed">{item.detail}</span>
                        )}
                        {item.pourquoi && (
                          <span className="block text-xs text-dim mt-1 italic">Pourquoi : {item.pourquoi}</span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {plan && (
              <p className="text-xs text-dim mt-3 pt-2 border-t border-line/40">
                Objectif fin de semaine : {plan.resultat_attendu}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
