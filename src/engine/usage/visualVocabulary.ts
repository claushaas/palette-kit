import type { UsageStrategy } from "./strategy.js";

export const visualVocabularyUsageStrategy = Object.freeze({
  usage: "visualVocabulary",
  resolve(input) {
    return Object.freeze({
      usage: "visualVocabulary",
      intent: input.intent,
    });
  },
} satisfies UsageStrategy<"visualVocabulary">);
