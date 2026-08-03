import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export const GOOGLE_DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Official Google Gemini adapter (Google Generative AI API).
 * Requires GOOGLE_GENERATIVE_AI_API_KEY. Model can be overridden via AI_MODEL.
 */
export function createGoogleModel(modelId?: string): LanguageModel {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("AI assistant is not configured.");

  const provider = createGoogleGenerativeAI({ apiKey });
  return provider(modelId || GOOGLE_DEFAULT_MODEL);
}
