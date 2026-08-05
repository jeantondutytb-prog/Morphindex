"use client";

import { useMemo, useState } from "react";
import {
  DOMAINS,
  DOMAIN_LABELS,
  dimensionLabel,
  dimensionsByDomain,
  type DimensionScore,
  type Domain,
} from "@/lib/ai/dimensions";
import { AppSectionLabel } from "@/components/app/ui";

export function DimensionsExplorer({
  dimensions,
  defaultOpen = true,
}: {
  dimensions: DimensionScore[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState<Domain | "all">("all");
  const [sortLow, setSortLow] = useState(true);

  const scoreMap = useMemo(
    () => new Map(dimensions.map((d) => [d.id, d.score])),
    [dimensions],
  );

  const sorted = useMemo(() => {
    let list = [...dimensions];
    if (filter !== "all") {
      const ids = new Set(dimensionsByDomain(filter).map((d) => d.id));
      list = list.filter((d) => ids.has(d.id));
    }
    list.sort((a, b) => (sortLow ? a.score - b.score : b.score - a.score));
    return list;
  }, [dimensions, filter, sortLow]);

  const weakest = sorted.slice(0, 5);

  return (
    <div className="rounded-xl border border-line bg-bg/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-surface/40 transition text-left"
      >
        <div>
          <AppSectionLabel>{dimensions.length} dimensions détaillées</AppSectionLabel>
          <p className="text-sm text-muted -mt-1">Plan construit de A à Z sur chaque levier actionnable</p>
        </div>
        <span className="text-dim text-sm shrink-0" aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-line/60">
          {weakest.length > 0 && (
            <div className="mt-4 mb-4 rounded-lg border border-accent/20 bg-accent/5 p-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-accent mb-2">
                Priorités routine
              </p>
              <ul className="space-y-1">
                {weakest.map((d) => (
                  <li key={d.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-muted truncate">{dimensionLabel(d.id)}</span>
                    <span className="font-mono tnum text-accent shrink-0">{d.score.toFixed(1).replace(".", ",")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="Toutes" />
            {DOMAINS.map((d) => (
              <FilterPill
                key={d}
                active={filter === d}
                onClick={() => setFilter(d)}
                label={DOMAIN_LABELS[d]}
              />
            ))}
            <button
              type="button"
              onClick={() => setSortLow((v) => !v)}
              className="ml-auto font-mono text-[9px] uppercase tracking-wider text-dim border border-line px-2 py-1 rounded-full hover:text-muted transition"
            >
              {sortLow ? "↑ plus faibles" : "↓ plus fortes"}
            </button>
          </div>

          <ul className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {sorted.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface/50 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-text block truncate">{dimensionLabel(d.id)}</span>
                </div>
                <div className="w-16 h-1 bg-line rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full ${d.score < 5 ? "bg-accent" : "bg-line-strong"}`}
                    style={{ width: `${d.score * 10}%` }}
                  />
                </div>
                <span className="font-mono text-xs tnum text-muted w-8 text-right shrink-0">
                  {d.score.toFixed(1).replace(".", ",")}
                </span>
              </li>
            ))}
          </ul>

          {filter === "all" && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DOMAINS.map((domain) => {
                const defs = dimensionsByDomain(domain);
                const scored = defs.filter((def) => scoreMap.has(def.id));
                const avg =
                  scored.length > 0
                    ? scored.reduce((s, def) => s + (scoreMap.get(def.id) ?? 0), 0) / scored.length
                    : null;
                return (
                  <div key={domain} className="rounded-lg border border-line/60 bg-bg/40 px-2 py-2 text-center">
                    <p className="font-mono text-[8px] uppercase text-dim truncate">{DOMAIN_LABELS[domain]}</p>
                    <p className="font-mono text-sm tnum text-text">
                      {avg != null ? avg.toFixed(1).replace(".", ",") : "—"}
                    </p>
                    <p className="text-[9px] text-dim">{scored.length} dim.</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition ${
        active
          ? "bg-accent/15 text-accent border border-accent/30"
          : "border border-line text-dim hover:text-muted"
      }`}
    >
      {label}
    </button>
  );
}
