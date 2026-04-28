import type { UsageStrategy } from "./strategy.js";

export const fillUsageStrategy = Object.freeze({
  usage: "fill",
  resolve(input) {
    return Object.freeze({
      usage: "fill",
      intent: input.intent,
    });
  },
} satisfies UsageStrategy<"fill">);
