import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { NexaAiProviderAdapter } from "./types";

export const GOOGLE_DEFAULT_MODEL = "gemini-flash-latest";

/**
 * Google Gemini adapter for Nexa Trade Mart AI.
 *
 * Gemini is an external provider implementation.
 * Nexa Trade Mart AI does not depend on Google-specific APIs
 * outside this adapter.
 */
export const googleAdapter: NexaAiProviderAdapter = {
  name: "google",

  createModel(modelId?: string): LanguageModel {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new Error("AI assistant is not configured.");
    }

    const provider = createGoogleGenerativeAI({
      apiKey,
    });

    return provider(modelId || GOOGLE_DEFAULT_MODEL);
  },
};

export function createGoogleModel(modelId?: string): LanguageModel {
  return googleAdapter.createModel(modelId);
}
