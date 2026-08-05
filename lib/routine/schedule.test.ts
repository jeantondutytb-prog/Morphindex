import { describe, it, expect } from "vitest";
import {
  currentRoutineWeek,
  itemsForWeek,
  tasksForDay,
  type RoutineItem,
} from "./schedule";

const routine: RoutineItem[] = [
  { moment: "matin", action: "nettoyant", produit: null, frequence: "quotidien", semaine_debut: 1 },
  { moment: "soir", action: "hydratant", produit: null, frequence: "quotidien", semaine_debut: 1 },
  { moment: "matin", action: "vitamine C", produit: null, frequence: "quotidien", semaine_debut: 2 },
  { moment: "hebdo", action: "exfoliation", produit: null, frequence: "1× par semaine", semaine_debut: 4 },
];

describe("itemsForWeek", () => {
  it("cumule les items des semaines précédentes", () => {
    expect(itemsForWeek(routine, 1)).toHaveLength(2);
    expect(itemsForWeek(routine, 2)).toHaveLength(3);
    expect(itemsForWeek(routine, 4)).toHaveLength(4);
  });
});

describe("currentRoutineWeek", () => {
  it("retourne semaine 1 au début", () => {
    const start = new Date("2026-08-01T12:00:00Z");
    expect(currentRoutineWeek(start, new Date("2026-08-02T12:00:00Z"))).toBe(1);
  });

  it("plafonne à 4", () => {
    const start = new Date("2026-01-01T12:00:00Z");
    expect(currentRoutineWeek(start, new Date("2026-03-01T12:00:00Z"))).toBe(4);
  });
});

describe("tasksForDay", () => {
  it("inclut matin et soir quotidiens chaque jour", () => {
    expect(tasksForDay(routine, 1, 3)).toHaveLength(2);
  });

  it("n'inclut hebdo que le lundi (index 0)", () => {
    expect(tasksForDay(routine, 4, 0).some((t) => t.item.moment === "hebdo")).toBe(true);
    expect(tasksForDay(routine, 4, 2).some((t) => t.item.moment === "hebdo")).toBe(false);
  });

  it("place 3x/semaine sur lun mer ven", () => {
    const r: RoutineItem[] = [
      { moment: "soir", action: "retinol", produit: null, frequence: "3× par semaine", semaine_debut: 3 },
    ];
    expect(tasksForDay(r, 3, 0)).toHaveLength(1);
    expect(tasksForDay(r, 3, 1)).toHaveLength(0);
    expect(tasksForDay(r, 3, 2)).toHaveLength(1);
    expect(tasksForDay(r, 3, 4)).toHaveLength(1);
  });
});
