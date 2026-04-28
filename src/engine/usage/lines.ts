import type { UsageStrategy } from "./strategy.js";

export const linesUsageStrategy = Object.freeze({
  usage: "lines",
  resolve(input) {
    return Object.freeze({
      usage: "lines",
      intent: input.intent,
    });
  },
} satisfies UsageStrategy<"lines">);
