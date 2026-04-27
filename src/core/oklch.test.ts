import { describe, expect, it } from "vitest";

import { assertOklchColor, isOklchColor, normalizeOklch } from "./oklch.js";

describe("normalizeOklch", () => {
  it("normalizes a color with default alpha", () => {
    expect(normalizeOklch({ l: 52, c: 0.14, h: 260 })).toEqual({
      space: "oklch",
      l: 52,
      c: 0.14,
      h: 260,
      alpha: 1,
    });
  });

  it("normalizes hue into the canonical range", () => {
    expect(normalizeOklch({ l: 52, c: 0.14, h: -30 }).h).toBe(330);
    expect(normalizeOklch({ l: 52, c: 0.14, h: 390 }).h).toBe(30);
    expect(normalizeOklch({ l: 52, c: 0.14, h: 360 }).h).toBe(0);
  });

  it("accepts valid channel boundaries", () => {
    expect(normalizeOklch({ l: 0, c: 0, h: 0, alpha: 0 })).toEqual({
      space: "oklch",
      l: 0,
      c: 0,
      h: 0,
      alpha: 0,
    });

    expect(normalizeOklch({ l: 100, c: 0.2, h: 359, alpha: 1 })).toEqual({
      space: "oklch",
      l: 100,
      c: 0.2,
      h: 359,
      alpha: 1,
    });
  });

  it("rejects non-finite channel values", () => {
    expect(() => normalizeOklch({ l: Number.NaN, c: 0, h: 0 })).toThrow(
      "OKLCH l must be a finite number.",
    );
    expect(() => normalizeOklch({ l: 50, c: Number.POSITIVE_INFINITY, h: 0 })).toThrow(
      "OKLCH c must be a finite number.",
    );
    expect(() => normalizeOklch({ l: 50, c: 0, h: Number.NEGATIVE_INFINITY })).toThrow(
      "OKLCH h must be a finite number.",
    );
    expect(() => normalizeOklch({ l: 50, c: 0, h: 0, alpha: Number.NaN })).toThrow(
      "OKLCH alpha must be a finite number.",
    );
  });

  it("rejects out-of-range channel values", () => {
    expect(() => normalizeOklch({ l: -1, c: 0, h: 0 })).toThrow(
      "OKLCH l must be between 0 and 100.",
    );
    expect(() => normalizeOklch({ l: 101, c: 0, h: 0 })).toThrow(
      "OKLCH l must be between 0 and 100.",
    );
    expect(() => normalizeOklch({ l: 50, c: -0.1, h: 0 })).toThrow(
      "OKLCH c must be greater than or equal to 0.",
    );
    expect(() => normalizeOklch({ l: 50, c: 0, h: 0, alpha: -0.1 })).toThrow(
      "OKLCH alpha must be between 0 and 1.",
    );
    expect(() => normalizeOklch({ l: 50, c: 0, h: 0, alpha: 1.1 })).toThrow(
      "OKLCH alpha must be between 0 and 1.",
    );
  });
});

describe("OKLCH validation helpers", () => {
  const color = {
    space: "oklch",
    l: 52,
    c: 0.14,
    h: 260,
    alpha: 1,
  };

  it("identifies normalized OKLCH colors", () => {
    expect(isOklchColor(color)).toBe(true);
    expect(isOklchColor({ ...color, h: 360 })).toBe(false);
    expect(isOklchColor({ ...color, alpha: undefined })).toBe(false);
    expect(isOklchColor({ ...color, space: "srgb" })).toBe(false);
  });

  it("asserts normalized OKLCH colors", () => {
    expect(() => assertOklchColor(color)).not.toThrow();
    expect(() => assertOklchColor({ ...color, c: -1 })).toThrow(
      "Expected a normalized OKLCH color.",
    );
  });
});
