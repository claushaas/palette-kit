import { describe, expect, it } from "vitest";

import { contrastRatio } from "./wcag2.js";

describe("wcag2 contrastRatio", () => {
  it("returns high contrast for black on white", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 });
    expect(ratio).toBeGreaterThan(10);
  });

  it("returns lower contrast for mid gray on white", () => {
    const gray = 0x77 / 255;
    const ratio = contrastRatio({ r: gray, g: gray, b: gray }, { r: 1, g: 1, b: 1 });
    expect(ratio).toBeLessThan(4.5);
  });

  it("does not return NaN", () => {
    const ratio = contrastRatio({ r: 0.2, g: 0.4, b: 0.6 }, { r: 0.8, g: 0.7, b: 0.1 });
    expect(Number.isNaN(ratio)).toBe(false);
  });
});
