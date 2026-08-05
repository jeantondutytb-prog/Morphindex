export type PreviousAnalysisSnapshot = {
  created_at: string;
  indice_actuel: number | null;
  indice_atteignable: number | null;
  scores: Record<string, number> | null;
  dimensions?: { id: string; score: number }[] | null;
  points?: { libelle: string; dimension: string; impact: string }[] | null;
  routine?: {
    resume?: { vision?: string; axes_cibles?: string[]; dimensions_cibles?: string[] };
    plan_semaines?: { semaine: number; titre: string; objectif: string }[];
  } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function topDimensions(
  dimensions: { id: string; score: number }[] | null | undefined,
  n: number,
): string[] {
  if (!dimensions?.length) return [];
  return [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((d) => `${d.id} (${d.score.toFixed(1)}/10)`);
}

export function buildFollowUpContext(prev: PreviousAnalysisSnapshot): string {
  const date = formatDate(prev.created_at);
  const scores = prev.scores ?? {};
  const domainLines = Object.entries(scores)
    .map(([k, v]) => `${k}: ${Number(v).toFixed(1)}/10`)
    .join(", ");

  const weakDims = topDimensions(prev.dimensions ?? null, 12);
  const strongDims = prev.dimensions?.length
    ? [...prev.dimensions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((d) => `${d.id} (${d.score.toFixed(1)}/10)`)
    : [];

  const topPoints = (prev.points ?? [])
    .slice(0, 8)
    .map((p) => `- ${p.libelle} [${p.dimension}, impact ${p.impact}]`)
    .join("\n");

  const vision = prev.routine?.resume?.vision ?? "";
  const axes = prev.routine?.resume?.axes_cibles?.join(", ") ?? "";
  const plan = (prev.routine?.plan_semaines ?? [])
    .map((s) => `S${s.semaine} — ${s.titre}: ${s.objectif}`)
    .join("\n");

  return [
    `## Analyse de suivi — contexte de l'analyse précédente (${date})`,
    ``,
    `Ceci est une **analyse de suivi**, pas une première analyse. Tu dois **compléter et mixer** avec le bilan précédent :`,
    `- Compare les scores actuels aux scores précédents (progrès, stagnation, régression).`,
    `- Mets en avant ce qui a fonctionné et ce qui n'a pas bougé.`,
    `- Ajuste la routine : conserve ce qui marche, remplace ou intensifie ce qui stagne.`,
    `- L'indice actuel et atteignable doivent refléter l'évolution réelle depuis la première analyse.`,
    `- Les points d'amélioration doivent prioriser les axes encore faibles ou en régression.`,
    ``,
    `### Bilan précédent`,
    `Indice actuel : ${prev.indice_actuel?.toFixed(1) ?? "?"}/10 · Indice atteignable : ${prev.indice_atteignable?.toFixed(1) ?? "?"}/10`,
    `Scores domaines : ${domainLines || "non disponibles"}`,
    ``,
    weakDims.length > 0 && `Dimensions les plus faibles avant : ${weakDims.join(", ")}`,
    strongDims.length > 0 && `Dimensions déjà solides : ${strongDims.join(", ")}`,
    ``,
    topPoints && `Points d'amélioration précédents :\n${topPoints}`,
    ``,
    vision && `Vision routine précédente : ${vision}`,
    axes && `Axes ciblés : ${axes}`,
    plan && `Plan 4 semaines précédent :\n${plan}`,
    ``,
    `Analyse cette **nouvelle photo** en tenant compte de tout ce contexte, puis rends le JSON demandé.`,
  ]
    .filter(Boolean)
    .join("\n");
}
