import type { LanguageModel } from "ai";
import type { NexaAiProviderAdapter } from "./types";

export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

/**
 * OpenAI adapter for Nexa Trade Mart AI.
 *
 * This adapter is intentionally isolated from the Nexa AI core.
 * OpenAI can be enabled or replaced without changing Nexa's AI
 * application layer.
 */
export const openAIAdapter: NexaAiProviderAdapter = {
  name: "openai",

  createModel(_modelId?: string): LanguageModel {
    throw new Error(
      "The OpenAI adapter is not configured yet. Configure the OpenAI adapter before selecting AI_PROVIDER=openai.",
    );
  },
};

export function createOpenAIModel(modelId?: string): LanguageModel {
  return openAIAdapter.createModel(modelId);
}
