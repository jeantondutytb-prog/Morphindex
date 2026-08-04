import { AXES } from "@/lib/ai/analysis-schema";
import { AppCard, AppSectionLabel } from "@/components/app/ui";

type Scores = Record<(typeof AXES)[number], number>;

export function ScoresPanel({ scores }: { scores: Scores }) {
  return (
    <AppCard>
      <AppSectionLabel>Sous-scores</AppSectionLabel>
      <div className="space-y-3.5">
        {AXES.map((axe, i) => (
          <div key={axe} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-dim w-20 uppercase shrink-0">{axe}</span>
            <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full bar-fill"
                style={{ width: `${scores[axe] * 10}%`, animationDelay: `${i * 60}ms` }}
              />
            </div>
            <span className="font-mono text-xs tnum text-text w-8 text-right shrink-0">
              {scores[axe].toFixed(1).replace(".", ",")}
            </span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
