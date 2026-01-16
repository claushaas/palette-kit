import { converter } from "culori";
import { describe, expect, it } from "vitest";

import { generateScale } from "./generateScale.js";

const toOklch = converter("oklch");

const seed = (() => {
  const oklch = toOklch("#3d63dd");

  if (!oklch) {
    throw new Error("Failed to convert seed color");
  }

  return {
    l: (oklch.l ?? 0) * 100,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
  };
})();

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
