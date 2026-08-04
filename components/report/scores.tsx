import { AXES } from "@/lib/ai/analysis-schema";

type Scores = Record<(typeof AXES)[number], number>;

export function ScoresPanel({ scores }: { scores: Scores }) {
  return (
    <div className="space-y-3">
      {AXES.map((axe) => (
        <div key={axe} className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-dim w-20 uppercase">{axe}</span>
          <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${scores[axe] * 10}%` }}
            />
          </div>
          <span className="font-mono text-xs tnum text-text w-8 text-right">
            {scores[axe].toFixed(1).replace(".", ",")}
          </span>
        </div>
      ))}
    </div>
  );
}
