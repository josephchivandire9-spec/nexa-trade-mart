import type { LanguageModel } from "ai";
import { createLovableModel } from "./providers/lovable";
import { createGoogleModel } from "./providers/google";
import { createOpenAIModel } from "./providers/openai";

export type AiProviderName = "lovable" | "google" | "openai";

/** Active provider, driven by env. Defaults to Lovable (current behaviour). */
export function getAiProviderName(): AiProviderName {
  const raw = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  if (raw === "google" || raw === "openai" || raw === "lovable") return raw;
  return "lovable";
}

/**
 * Returns the chat model for the active provider.
 * Callers must not import provider-specific modules directly.
 */
export function getChatModel(modelId?: string): LanguageModel {
  const model = modelId || process.env.AI_MODEL || undefined;
  switch (getAiProviderName()) {
    case "google":
      return createGoogleModel(model);
    case "openai":
      return createOpenAIModel(model);
    case "lovable":
    default:
      return createLovableModel(model);
  }
}
