import { describe, expect, it } from "vitest";

import { applyEmphasisOperator } from "./emphasis.js";

const base = {
  oklch: { l: 62, c: 0.06, h: 215 },
  context: "light" as const,
  surface: "surface" as const,
  usage: "text" as const,
  state: "default" as const,
  emphasis: "default" as const,
  preset: "modern" as const,
  step: 11,
};

describe("applyEmphasisOperator", () => {
  it("muted and subtle reduce chroma predictably", () => {
    const muted = applyEmphasisOperator({ ...base, emphasis: "muted" });
    const subtle = applyEmphasisOperator({ ...base, emphasis: "subtle" });

    expect(muted.c).toBeLessThan(base.oklch.c);
    expect(subtle.c).toBeLessThan(base.oklch.c);
    expect(subtle.c).toBeGreaterThan(muted.c);
  });

  it("strong increases chroma", () => {
    const strong = applyEmphasisOperator({ ...base, emphasis: "strong" });

    expect(strong.c).toBeGreaterThan(base.oklch.c);
  });

  it("does not change hue", () => {
    const muted = applyEmphasisOperator({ ...base, emphasis: "muted" });

    expect(muted.h).toBeCloseTo(base.oklch.h, 6);
  });
});
