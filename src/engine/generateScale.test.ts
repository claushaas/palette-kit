import { describe, expect, it } from "vitest";

import { generateScale } from "./generateScale.js";

const seed = { l: 49.5, c: 0.19, h: 264.0 };

const isMonotonic = (values: number[]) =>
  values.every((value, index) => index === 0 || value >= values[index - 1] - 1e-6);

describe("generateScale", () => {
  it("returns 12 steps", () => {
    const result = generateScale(seed, { context: "light", surface: "surface" });

    expect(result).toHaveLength(12);
  });

  it("keeps lightness monotonic in light context", () => {
    const result = generateScale(seed, { context: "light", surface: "surface" });
    const lightness = result.map((step) => step.l);

    expect(isMonotonic(lightness)).toBe(true);
  });

  it("keeps lightness monotonic in dark context", () => {
    const result = generateScale(seed, { context: "dark", surface: "surface" });
    const lightness = result.map((step) => step.l);

    expect(isMonotonic(lightness)).toBe(true);
  });

  it("keeps hue constant across steps", () => {
    const result = generateScale(seed, { context: "light", surface: "surface" });

    result.forEach((step) => {
      expect(step.h).toBeCloseTo(seed.h, 6);
    });
  });

  it("never produces negative chroma", () => {
    const result = generateScale(seed, { context: "light", surface: "surface" });

    result.forEach((step) => {
      expect(step.c).toBeGreaterThanOrEqual(0);
    });
  });
});
