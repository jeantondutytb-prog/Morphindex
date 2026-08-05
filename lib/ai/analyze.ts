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
  routine_resume: {
    vision:
      "Sur 4 semaines, tu stabilises ta barrière cutanée (score peau 5,8), tu attaques la coloration sous les yeux, et tu corriges deux leviers rapides — coupe et posture — pour rapprocher ton indice de 7,8. Ce plan ne promet rien : il te donne une trajectoire claire.",
    axes_cibles: ["peau", "cernes", "coupe", "posture"],
  },
  plan_semaines: [
    {
      semaine: 1,
      titre: "Barrière cutanée + habitudes",
      objectif:
        "Poser un nettoyage et une hydratation adaptés à ta peau normale, sans tout recommencer puisque tu utilises déjà un nettoyant.",
      resultat_attendu: "Peau confortable le matin, SPF appliqué systématiquement, barbe délimitée proprement.",
    },
    {
      semaine: 2,
      titre: "Éclat et cernes",
      objectif:
        "Introduire vitamine C le matin et un soin caféine le soir pour cibler ta coloration sous-orbitaire (axe cernes 4,4).",
      resultat_attendu: "Teint plus homogène en fin de journée, contour des yeux moins marqué au réveil.",
    },
    {
      semaine: 3,
      titre: "Renouvellement ciblé",
      objectif:
        "Ajouter un rétinaldéhyde progressif pour la texture de peau, tout en travaillant ta ligne de barbe et ton port de tête.",
      resultat_attendu: "Texture affinée sans irritation, barbe plus nette, nuque dégagée.",
    },
    {
      semaine: 4,
      titre: "Consolidation",
      objectif:
        "Ancrer les actifs avec des soins hebdo et finaliser la coupe — tu tiens une routine que tu peux prolonger.",
      resultat_attendu: "Routine fluide en moins de 15 min matin/soir, résultats stables sur peau et cernes.",
    },
  ],
  routine: [
    {
      moment: "matin",
      action: "Nettoyer avec nettoyant doux pH 5,5",
      produit: "nettoyant doux pH 5,5",
      frequence: "quotidien",
      semaine_debut: 1,
      pourquoi: "Ta peau manque d'hydratation — un nettoyage agressif aggraverait les tiraillements.",
      axe: "peau",
      detail: "30 s de massage sur peau humide, rincer à l'eau tiède, tamponner sans frotter.",
    },
    {
      moment: "matin",
      action: "Appliquer crème solaire SPF 50 fluide",
      produit: "crème solaire SPF 50 texture fluide",
      frequence: "quotidien",
      semaine_debut: 1,
      pourquoi: "Protège les actifs que tu introduiras ensuite et limite les marques post-inflammatoires.",
      axe: "peau",
      detail: "2 doigts de produit sur visage et cou, réappliquer si exposition > 2 h.",
    },
    {
      moment: "soir",
      action: "Hydrater avec crème légère non comédogène",
      produit: "crème hydratante légère",
      frequence: "quotidien",
      semaine_debut: 1,
      pourquoi: "Compense le déficit d'hydratation identifié sur l'axe peau.",
      axe: "peau",
      detail: "Noisette sur peau légèrement humide, étaler du centre vers l'extérieur.",
    },
    {
      moment: "hebdo",
      action: "Redessiner la ligne de barbe et nuque",
      produit: null,
      frequence: "2× par semaine",
      semaine_debut: 1,
      pourquoi: "Tes lignes de barbe sont irrégulières — un contour net structure le bas du visage.",
      axe: "pilosite",
      detail: "Rasoir ou tondeuse : ligne joues horizontale au zygomatique, nuque 2 cm au-dessus Adam's apple.",
    },
    {
      moment: "matin",
      action: "Sérum vitamine C 10 %",
      produit: "sérum vitamine C 10 %",
      frequence: "quotidien",
      semaine_debut: 2,
      pourquoi: "Uniformise le teint et prépare la peau avant le SPF — complément à ta déshydratation.",
      axe: "peau",
      detail: "3–4 gouttes sur peau sèche, laisser 1 min avant la crème solaire.",
    },
    {
      moment: "soir",
      action: "Contour des yeux caféine 5 %",
      produit: "contour des yeux caféine 5 %",
      frequence: "quotidien",
      semaine_debut: 2,
      pourquoi: "Cible directement ta coloration sous-orbitaire (cernes 4,4).",
      axe: "cernes",
      detail: "Grain de riz par œil, tapoter avec l'annulaire, jamais frotter.",
    },
    {
      moment: "soir",
      action: "Rétinaldéhyde 0,05 %",
      produit: "rétinaldéhyde 0,05 %",
      frequence: "3× par semaine",
      semaine_debut: 3,
      pourquoi: "Améliore la texture cutanée sans l'agressivité d'un rétinol fort.",
      axe: "peau",
      detail: "Lundi, mercredi, vendredi soir — après nettoyage, avant crème. Pas le même soir que exfoliation.",
    },
    {
      moment: "hebdo",
      action: "Exercice posture nuque (chin tucks)",
      produit: null,
      frequence: "3× par semaine",
      semaine_debut: 3,
      pourquoi: "Ton port de tête est légèrement avancé — ce geste le corrige sans matériel.",
      axe: "posture",
      detail: "10 répétitions : reculer le menton comme un double menton, tenir 5 s, dos droit.",
    },
    {
      moment: "hebdo",
      action: "Exfoliation enzymatique douce",
      produit: "exfoliant enzymatique doux",
      frequence: "1× par semaine",
      semaine_debut: 4,
      pourquoi: "Désobstrue les pores avant de stabiliser la routine long terme.",
      axe: "peau",
      detail: "Dimanche soir, 2 min max, rincer — jamais la veille d'une nuit rétinaldéhyde.",
    },
    {
      moment: "hebdo",
      action: "Masque hydratant 15 min",
      produit: "masque hydratant",
      frequence: "1× par semaine",
      semaine_debut: 4,
      pourquoi: "Boost hebdo pour sceller les gains d'hydratation de la semaine 1.",
      axe: "peau",
      detail: "Couche généreuse, 15 min, retirer l'excédent sans rincer si texture gel.",
    },
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
