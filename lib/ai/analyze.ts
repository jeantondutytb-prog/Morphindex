import Anthropic from "@anthropic-ai/sdk";
import { analysisSchema, ANALYSIS_JSON_SCHEMA, type Analysis } from "./analysis-schema";
import { SYSTEM_PROMPT, buildUserContext } from "./prompt";
import type { OnboardingData } from "@/lib/onboarding/schema";

const client = new Anthropic();

export type AnalysisResult =
  | { ok: true; data: Analysis; cacheRead: number }
  | { ok: false; reason: "refusal" | "invalid_output" | "api_error"; detail: string };

/** Interdit MORPHINDEX_FAKE_ANALYSIS=1 lorsque NODE_ENV=production. */
export function validateFakeAnalysisEnv(): void {
  if (
    process.env.MORPHINDEX_FAKE_ANALYSIS === "1" &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error(
      "MORPHINDEX_FAKE_ANALYSIS=1 est interdit lorsque NODE_ENV=production. Retire cette variable.",
    );
  }
}

function isFakeAnalysisEnabled(): boolean {
  validateFakeAnalysisEnv();
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.MORPHINDEX_FAKE_ANALYSIS === "1"
  );
}

const FAKE_ANALYSIS_DATA: Analysis = {
  scores: {
    peau: 5.8,
    cernes: 4.4,
    pilosite: 7.9,
    coupe: 6.2,
    posture: 5.1,
    composition: 6.0,
    dents: 7.1,
  },
  indice_actuel: 6.4,
  indice_atteignable: 7.8,
  points: [
    { axe: "peau", libelle: "hydratation insuffisante de la peau", impact: "fort" },
    { axe: "cernes", libelle: "coloration sous-orbitaire visible", impact: "fort" },
    { axe: "coupe", libelle: "coupe peu adaptée à la forme du visage", impact: "moyen" },
    { axe: "posture", libelle: "port de tête légèrement avancé", impact: "moyen" },
    { axe: "pilosite", libelle: "lignes de barbe irrégulières", impact: "faible" },
  ],
  routine: [
    { moment: "matin", action: "nettoyant doux pH 5,5", produit: null, frequence: "quotidien", semaine_debut: 1 },
    { moment: "matin", action: "crème solaire SPF 50 texture fluide", produit: null, frequence: "quotidien", semaine_debut: 1 },
    { moment: "soir", action: "crème hydratante légère", produit: null, frequence: "quotidien", semaine_debut: 1 },
    { moment: "matin", action: "sérum vitamine C 10 %", produit: null, frequence: "quotidien", semaine_debut: 2 },
    { moment: "soir", action: "contour des yeux caféine 5 %", produit: null, frequence: "quotidien", semaine_debut: 2 },
    { moment: "soir", action: "rétinaldéhyde 0,05 %", produit: null, frequence: "3× par semaine", semaine_debut: 3 },
    { moment: "hebdo", action: "exfoliation enzymatique douce", produit: null, frequence: "1× par semaine", semaine_debut: 4 },
    { moment: "hebdo", action: "masque hydratant 15 min", produit: null, frequence: "1× par semaine", semaine_debut: 4 },
  ],
};

// Validé une fois à l'import : la réponse factice doit toujours passer le schéma.
const _fakeCheck = analysisSchema.safeParse(FAKE_ANALYSIS_DATA);
if (!_fakeCheck.success) {
  throw new Error("FAKE_ANALYSIS_DATA invalide : " + _fakeCheck.error.message);
}

async function runFakeAnalysis(): Promise<AnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { ok: true, data: FAKE_ANALYSIS_DATA, cacheRead: 0 };
}

export async function runAnalysis(
  imageBase64: string,
  profile: OnboardingData,
): Promise<AnalysisResult> {
  if (isFakeAnalysisEnabled()) {
    return runFakeAnalysis();
  }

  try {
    const params = {
      model: "claude-sonnet-5",
      max_tokens: 8000,
      thinking: { type: "disabled" as const },
      system: [
        { type: "text" as const, text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" as const } },
      ],
      output_config: {
        effort: "low" as const,
        format: { type: "json_schema" as const, schema: ANALYSIS_JSON_SCHEMA },
      },
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "image" as const,
              source: { type: "base64" as const, media_type: "image/jpeg" as const, data: imageBase64 },
            },
            { type: "text" as const, text: buildUserContext(profile) },
          ],
        },
      ],
    };

    const response = await client.messages.create(
      params as unknown as Anthropic.MessageCreateParamsNonStreaming,
    );

    // Toujours AVANT de lire le contenu : sur un refus, `content` peut être
    // vide et un accès direct planterait.
    if (response.stop_reason === "refusal") {
      return { ok: false, reason: "refusal", detail: "refus des classificateurs" };
    }

    // `output_config.format` garantit que le premier bloc texte est du JSON
    // conforme au schéma envoyé — mais pas conforme aux bornes (voir plus haut).
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, reason: "invalid_output", detail: "aucun bloc texte dans la réponse" };
    }

    let brut: unknown;
    try {
      brut = JSON.parse(textBlock.text);
    } catch {
      return { ok: false, reason: "invalid_output", detail: "JSON illisible" };
    }

    const parsed = analysisSchema.safeParse(brut);
    if (!parsed.success) {
      // On remonte les chemins fautifs, pas les valeurs : l'analyse porte sur
      // une photo de visage et ne doit pas finir en clair dans les journaux.
      const champs = parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".") || "racine"}: ${i.code}`)
        .join(" | ");
      return { ok: false, reason: "invalid_output", detail: champs || "sortie non conforme" };
    }

    return {
      ok: true,
      data: parsed.data,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
    };
  } catch (e) {
    // Sans ce message, la première analyse réelle qui échoue ne laisse aucune
    // trace exploitable : clé absente, rétention zéro non activée, image
    // refusée — tout se ressemblerait.
    const detail =
      e instanceof Anthropic.APIError
        ? `${e.status ?? "?"} ${e.name}: ${e.message}`
        : e instanceof Error
          ? `${e.name}: ${e.message}`
          : String(e);
    return { ok: false, reason: "api_error", detail };
  }
}
