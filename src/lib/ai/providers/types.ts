import type { LanguageModel } from "ai";

/**
 * Nexa Trade Mart AI provider adapter contract.
 *
 * Nexa Trade Mart AI owns the application and AI architecture.
 * External AI providers are interchangeable implementations behind
 * this adapter boundary.
 */
export interface NexaAiProviderAdapter {
  readonly name: string;
  createModel(modelId?: string): LanguageModel;
}
 
