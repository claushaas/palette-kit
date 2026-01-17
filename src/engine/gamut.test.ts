import { describe, expect, it } from "vitest";

import { isInGamut, mapToGamut } from "./gamut.js";
import type { OkLchColor } from "./generateScale.js";

describe("gamut mapping", () => {
  const outOfSrgbInP3: OkLchColor = { l: 60, c: 0.2, h: 40 };

  it("detects out-of-gamut sRGB colors", () => {
    expect(isInGamut(outOfSrgbInP3, "srgb")).toBe(false);
    expect(isInGamut(outOfSrgbInP3, "p3")).toBe(true);
  });

  it("clips to sRGB gamut", () => {
    const clipped = mapToGamut(outOfSrgbInP3, "srgb", "clip", false);
    expect(isInGamut(clipped, "srgb")).toBe(true);
  });

  it("compresses chroma to sRGB gamut", () => {
    const compressed = mapToGamut(outOfSrgbInP3, "srgb", "compressChroma", false);
    expect(isInGamut(compressed, "srgb")).toBe(true);
    expect(compressed.c).toBeLessThanOrEqual(outOfSrgbInP3.c);
  });

  it("keeps chroma when already in P3", () => {
    const mapped = mapToGamut(outOfSrgbInP3, "p3", "preferP3ThenCompress", false);
    expect(isInGamut(mapped, "p3")).toBe(true);
    expect(mapped.c).toBeCloseTo(outOfSrgbInP3.c, 4);
  });
});
