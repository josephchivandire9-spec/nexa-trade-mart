import type { LanguageModel } from "ai";
import { createGoogleModel } from "./providers/google";
import { createOpenAIModel } from "./providers/openai";

/**
 * Nexa Trade Mart AI
 *
 * This is the provider-independent AI layer owned by Nexa Trade Mart
 * and powered by TJCOS.
 *
 * Google, OpenAI, and future providers are adapters only.
 * The application must never depend directly on a provider.
 */
export type NexaAiProviderName = "google" | "openai";

/**
 * Returns the currently selected external provider adapter.
 *
 * The provider is infrastructure, not the identity of Nexa Trade Mart AI.
 */
export function getNexaAiProviderName(): NexaAiProviderName {
  const raw = (process.env.AI_PROVIDER || "").toLowerCase().trim();

  if (raw === "openai") {
    return "openai";
  }

  return "google";
}

/**
 * Nexa Trade Mart AI model gateway.
 *
 * Application code calls this function instead of calling Gemini,
 * OpenAI, or another provider directly.
 */
export function getNexaAiModel(modelId?: string): LanguageModel {
  const selectedModel = modelId || process.env.AI_MODEL || undefined;

  switch (getNexaAiProviderName()) {
    case "openai":
      return createOpenAIModel(selectedModel);

    case "google":
    default:
      return createGoogleModel(selectedModel);
  }
}

/**
 * Backward-compatible internal alias.
 *
 * Existing Nexa AI features can continue using getChatModel()
 * while the provider implementation remains fully replaceable.
 */
export const getChatModel = getNexaAiModel;
