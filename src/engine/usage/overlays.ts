import type { UsageStrategy } from "./strategy.js";

export const overlaysUsageStrategy = Object.freeze({
  usage: "overlays",
  resolve(input) {
    return Object.freeze({
      usage: "overlays",
      intent: input.intent,
    });
  },
} satisfies UsageStrategy<"overlays">);
