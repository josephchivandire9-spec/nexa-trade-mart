import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export const LOVABLE_DEFAULT_MODEL = "google/gemini-3-flash-preview";

/** Lovable AI Gateway adapter (OpenAI-compatible). */
export function createLovableModel(modelId?: string): LanguageModel {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI assistant is not configured.");

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

  return provider(modelId || LOVABLE_DEFAULT_MODEL);
}
