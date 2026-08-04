import Anthropic from "@anthropic-ai/sdk";
import { analysisSchema, ANALYSIS_JSON_SCHEMA, type Analysis } from "./analysis-schema";
import { SYSTEM_PROMPT, buildUserContext } from "./prompt";
import type { OnboardingData } from "@/lib/onboarding/schema";

const client = new Anthropic();

export type AnalysisResult =
  | { ok: true; data: Analysis; cacheRead: number }
  | { ok: false; reason: "refusal" | "invalid_output" | "api_error" };

/** Paramètres Sonnet 5 pas encore typés dans le SDK (@anthropic-ai/sdk). */
type Sonnet5Params = {
  model: string;
  max_tokens: number;
  thinking: { type: "disabled" };
  system: { type: "text"; text: string; cache_control?: { type: "ephemeral" } }[];
  output_config: {
    effort: "low";
    format: { type: "json_schema"; schema: typeof ANALYSIS_JSON_SCHEMA };
  };
  messages: {
    role: "user";
    content: (
      | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
      | { type: "text"; text: string }
    )[];
  }[];
};

export async function runAnalysis(
  imageBase64: string,
  profile: OnboardingData,
): Promise<AnalysisResult> {
  try {
    const params: Sonnet5Params = {
      model: "claude-sonnet-5",
      max_tokens: 8000,
      thinking: { type: "disabled" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANALYSIS_JSON_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: buildUserContext(profile) },
          ],
        },
      ],
    };

    const response = await client.messages.create(
      params as unknown as Anthropic.MessageCreateParamsNonStreaming,
    );

    if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, reason: "invalid_output" };

    const parsed = analysisSchema.safeParse(JSON.parse(textBlock.text));
    if (!parsed.success) return { ok: false, reason: "invalid_output" };

    return {
      ok: true,
      data: parsed.data,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
    };
  } catch {
    return { ok: false, reason: "api_error" };
  }
}
