import type { LanguageModel } from "ai";

export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Placeholder adapter for a direct OpenAI API connection.
 * Not active. Enabling it later requires an OPENAI_API_KEY secret —
 * no UI or database changes needed.
 */
export function createOpenAIModel(_modelId?: string): LanguageModel {
  throw new Error(
    "OpenAI provider is not enabled yet. Set AI_PROVIDER=lovable or configure the OpenAI adapter.",
  );
}
