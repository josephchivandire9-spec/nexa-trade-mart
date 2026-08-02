import type { LanguageModel } from "ai";

export const GOOGLE_DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Placeholder adapter for a direct Google (Gemini) API connection.
 * Not active. Enabling it later requires installing @ai-sdk/google and a
 * GOOGLE_GENERATIVE_AI_API_KEY secret — no UI or database changes needed.
 */
export function createGoogleModel(_modelId?: string): LanguageModel {
  throw new Error(
    "Google AI provider is not enabled yet. Set AI_PROVIDER=lovable or configure the Google adapter.",
  );
}
