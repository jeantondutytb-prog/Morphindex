import { describe, it, expect } from "vitest";
import { buildFollowUpContext } from "./follow-up-context";

describe("buildFollowUpContext", () => {
  it("inclut les scores et instructions de suivi", () => {
    const ctx = buildFollowUpContext({
      created_at: "2026-07-01T10:00:00Z",
      indice_actuel: 5.2,
      indice_atteignable: 6.8,
      scores: { peau: 4.5, cernes: 5.0, pilosite: 6.0, coupe: 5.5, posture: 6.0, composition: 5.0, dents: 7.0 },
      dimensions: [
        { id: "peau_texture", score: 4.2 },
        { id: "cernes_coloration", score: 5.1 },
      ],
      points: [{ libelle: "Hydrater le contour des yeux", dimension: "cernes_coloration", impact: "fort" }],
      routine: {
        resume: { vision: "Peau plus nette en 4 semaines", axes_cibles: ["peau"], dimensions_cibles: ["peau_texture"] },
        plan_semaines: [{ semaine: 1, titre: "Fondations", objectif: "Nettoyage doux" }],
      },
    });

    expect(ctx).toMatch(/analyse de suivi/i);
    expect(ctx).toMatch(/5\.2/);
    expect(ctx).toMatch(/peau_texture/);
    expect(ctx).toMatch(/Hydrater le contour des yeux/);
  });
});
