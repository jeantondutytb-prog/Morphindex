"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoutineItem } from "@/lib/routine/schedule";
import {
  ROUTINE_WEEKS,
  countDayTasks,
  currentRoutineWeek,
  tasksForDay,
  type RoutineWeek,
  weekDayLabels,
} from "@/lib/routine/schedule";

function storageKey(analysisId: string) {
  return `morphindex-routine:${analysisId}`;
}

export function RoutineTracker({
  analysisId,
  routine,
  startDate,
}: {
  analysisId: string;
  routine: RoutineItem[];
  startDate: string;
}) {
  const start = useMemo(() => new Date(startDate), [startDate]);
  const suggestedWeek = currentRoutineWeek(start);
  const [week, setWeek] = useState<RoutineWeek>(suggestedWeek);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openDay, setOpenDay] = useState<number>(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(analysisId));
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, [analysisId]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setChecked(next);
      try {
        localStorage.setItem(storageKey(analysisId), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [analysisId],
  );

  function toggle(id: string) {
    persist({ ...checked, [id]: !checked[id] });
  }

  const totalTasks = countDayTasks(routine, week);
  const doneTasks = useMemo(() => {
    let n = 0;
    for (let d = 0; d < 7; d++) {
      for (const t of tasksForDay(routine, week, d)) {
        if (checked[t.id]) n++;
      }
    }
    return n;
  }, [routine, week, checked]);

  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ROUTINE_WEEKS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeek(w)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              week === w
                ? "bg-accent text-accent-ink shadow-[0_4px_16px_rgba(0,229,160,.25)]"
                : "border border-line text-muted hover:border-accent/30 hover:text-text"
            }`}
          >
            Semaine {w}
            {w === suggestedWeek && (
              <span className="ml-1.5 font-mono text-[9px] uppercase opacity-80">actuelle</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-bg/30 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
            Progression semaine {week}
          </p>
          <p className="font-mono text-xs tnum text-muted">
            {doneTasks}/{totalTasks}
          </p>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-dim mt-2">
          Coche ce que tu as fait — sauvegardé sur cet appareil.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-7">
        {weekDayLabels().map((label, dayIndex) => {
          const dayTasks = tasksForDay(routine, week, dayIndex);
          const dayDone = dayTasks.filter((t) => checked[t.id]).length;
          const isOpen = openDay === dayIndex;

          return (
            <div key={label} className="sm:contents">
              <button
                type="button"
                onClick={() => setOpenDay(dayIndex)}
                className={`sm:hidden w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  isOpen ? "border-accent/30 bg-accent/5" : "border-line bg-surface/50"
                }`}
              >
                <span className="font-medium text-sm">{label}</span>
                <span className="font-mono text-[10px] text-dim">{dayDone}/{dayTasks.length}</span>
              </button>

              <div
                className={`rounded-xl border border-line bg-surface/50 overflow-hidden ${
                  isOpen ? "block" : "hidden sm:block"
                }`}
              >
                <div className="px-3 py-2.5 border-b border-line bg-bg/40 hidden sm:flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dim">{label}</span>
                  <span className="font-mono text-[9px] text-dim">{dayDone}/{dayTasks.length}</span>
                </div>

                {dayTasks.length === 0 ? (
                  <p className="p-3 text-xs text-dim">—</p>
                ) : (
                  <ul className="p-2 space-y-1">
                    {dayTasks.map((task) => {
                      const done = Boolean(checked[task.id]);
                      return (
                        <li key={task.id}>
                          <label
                            className={`flex items-start gap-2.5 rounded-lg px-2 py-2 cursor-pointer transition ${
                              done ? "opacity-60" : "hover:bg-bg/40"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                                done
                                  ? "border-accent bg-accent/20 text-accent"
                                  : "border-line bg-bg/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={() => toggle(task.id)}
                                className="sr-only"
                              />
                              {done && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-sm leading-snug ${done ? "line-through text-dim" : "text-text"}`}>
                                {task.label}
                              </span>
                              {task.sublabel && (
                                <span className="block text-[11px] text-dim mt-0.5">{task.sublabel}</span>
                              )}
                              {task.isNew && (
                                <span className="inline-block mt-1 font-mono text-[8px] uppercase tracking-wider text-accent border border-accent/25 bg-accent/8 px-1.5 py-0.5 rounded">
                                  nouveau
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
