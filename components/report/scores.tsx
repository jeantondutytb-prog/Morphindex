"use client";

import { useState } from "react";
import { DOMAINS, DOMAIN_LABELS, dimensionLabel, type DimensionScore, type Domain } from "@/lib/ai/dimensions";
import { AppCard, AppSectionLabel } from "@/components/app/ui";
import { DimensionsExplorer } from "@/components/report/dimensions-explorer";

type DomainScores = Record<Domain, number>;

export function ScoresPanel({
  scores,
  dimensions,
}: {
  scores: DomainScores;
  dimensions?: DimensionScore[] | null;
}) {
  const [expanded, setExpanded] = useState<Domain | null>(null);

  return (
    <div className="space-y-4">
      <AppCard>
        <AppSectionLabel>7 domaines · {dimensions?.length ?? 0} dimensions</AppSectionLabel>
        <div className="space-y-3.5">
          {DOMAINS.map((domain, i) => {
            const hasSubs = dimensions && dimensions.some((d) => d.id.startsWith(domain));
            const isOpen = expanded === domain;

            return (
              <div key={domain}>
                <button
                  type="button"
                  onClick={() => hasSubs && setExpanded(isOpen ? null : domain)}
                  className={`w-full flex items-center gap-3 ${hasSubs ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
                >
                  <span className="font-mono text-[10px] text-dim w-24 uppercase shrink-0 text-left">
                    {DOMAIN_LABELS[domain]}
                  </span>
                  <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full bar-fill"
                      style={{ width: `${scores[domain] * 10}%`, animationDelay: `${i * 60}ms` }}
                    />
                  </div>
                  <span className="font-mono text-xs tnum text-text w-8 text-right shrink-0">
                    {scores[domain].toFixed(1).replace(".", ",")}
                  </span>
                  {hasSubs && (
                    <span className="text-dim text-xs w-4 shrink-0" aria-hidden>
                      {isOpen ? "▾" : "▸"}
                    </span>
                  )}
                </button>

                {isOpen && dimensions && (
                  <DomainDimensionsList domain={domain} dimensions={dimensions} />
                )}
              </div>
            );
          })}
        </div>
      </AppCard>

      {dimensions && dimensions.length > 0 && (
        <DimensionsExplorer dimensions={dimensions} defaultOpen={false} />
      )}
    </div>
  );
}

function DomainDimensionsList({
  domain,
  dimensions,
}: {
  domain: Domain;
  dimensions: DimensionScore[];
}) {
  const subs = dimensions.filter((d) => d.id.startsWith(`${domain}_`) || (domain === "peau" && d.id.startsWith("entretien_")));
  if (subs.length === 0) return null;

  return (
    <ul className="mt-2 ml-2 pl-4 border-l border-line/60 space-y-1.5">
      {subs.map((d) => (
        <li key={d.id} className="flex items-center gap-2 text-xs">
          <span className="text-dim flex-1 truncate">{dimensionLabel(d.id)}</span>
          <span className="font-mono tnum text-muted shrink-0">{d.score.toFixed(1).replace(".", ",")}</span>
        </li>
      ))}
    </ul>
  );
}
