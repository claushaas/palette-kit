import { describe, expect, it } from "vitest";

import { applyEmphasisOperator } from "./emphasis.js";
import { getStepLightness } from "./utils.js";

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

  it("strong shifts text lightness by context", () => {
    const strongLight = applyEmphasisOperator({ ...base, emphasis: "strong", usage: "text" });
    const strongDark = applyEmphasisOperator({
      ...base,
      emphasis: "strong",
      usage: "text",
      context: "dark",
    });

    expect(strongLight.l).toBeLessThan(base.oklch.l);
    expect(strongDark.l).toBeGreaterThan(base.oklch.l);
  });

  it("does not change hue", () => {
    const muted = applyEmphasisOperator({ ...base, emphasis: "muted" });

    expect(muted.h).toBeCloseTo(base.oklch.h, 6);
  });

  it("inverted leaves backgrounds unchanged", () => {
    const invertedBg = applyEmphasisOperator({
      ...base,
      emphasis: "inverted",
      usage: "bg",
    });

    expect(invertedBg.l).toBeCloseTo(base.oklch.l, 6);
  });

  it("inverted leaves non-text usage unchanged", () => {
    const invertedBorder = applyEmphasisOperator({
      ...base,
      emphasis: "inverted",
      usage: "border",
    });

    expect(invertedBorder.l).toBeCloseTo(base.oklch.l, 6);
    expect(invertedBorder.c).toBeCloseTo(base.oklch.c, 6);
    expect(invertedBorder.h).toBeCloseTo(base.oklch.h, 6);
  });

  it("inverted moves text toward the target step without changing hue", () => {
    const targetL = getStepLightness(base.preset, base.surface, base.context, 12);
    const inverted = applyEmphasisOperator({
      ...base,
      emphasis: "inverted",
      usage: "text",
    });

    expect(Math.abs(inverted.l - targetL)).toBeLessThan(Math.abs(base.oklch.l - targetL));
    expect(inverted.h).toBeCloseTo(base.oklch.h, 6);
  });
});
