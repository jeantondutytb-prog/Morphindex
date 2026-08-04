import Anthropic from "@anthropic-ai/sdk";
import { analysisSchema, ANALYSIS_JSON_SCHEMA, type Analysis } from "./analysis-schema";
import { SYSTEM_PROMPT, buildUserContext } from "./prompt";
import type { OnboardingData } from "@/lib/onboarding/schema";

const client = new Anthropic();

export type AnalysisResult =
  | { ok: true; data: Analysis; cacheRead: number }
  | { ok: false; reason: "refusal" | "invalid_output" | "api_error"; detail: string };

export async function runAnalysis(
  imageBase64: string,
  profile: OnboardingData,
): Promise<AnalysisResult> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8000,

      // Explicite : sans ce champ, Sonnet 5 active le raisonnement adaptatif
      // par défaut et on paierait des tokens de réflexion pour une extraction
      // structurée qui n'en a pas besoin.
      thinking: { type: "disabled" },

      // Préfixe strictement statique + point de césure du cache. Le moindre
      // octet variable ici désactive le cache, sans erreur ni signal.
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],

      // Le schéma JSON strict ne supporte ni `minimum` ni `maximum` : les
      // bornes 0-10 ne sont donc PAS garanties par l'API. C'est la validation
      // Zod plus bas qui les tient — ne pas la retirer.
      //
      // (Le helper `zodOutputFormat` du SDK ferait les deux d'un coup, mais il
      // exige Zod 4 ; le projet est en Zod 3. À reconsidérer si Zod est migré.)
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANALYSIS_JSON_SCHEMA },
      },

      // Ni temperature, ni top_p, ni top_k : rejetés avec une 400 sur Sonnet 5.
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
            },
            { type: "text", text: buildUserContext(profile) },
          ],
        },
      ],
    });

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
