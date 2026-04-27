import { describe, expect, it } from "vitest";

import {
  CONVERSION_EPSILON,
  linearRgbToOklab,
  oklabToLinearRgb,
  oklabToOklch,
  oklchToOklab,
} from "./convert.js";

const ROUND_TRIP_EPSILON = 1e-7;

const expectCloseTo = (actual: number, expected: number) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(ROUND_TRIP_EPSILON);
};

describe("OKLCH and OKLab conversions", () => {
  it("converts neutral OKLCH to OKLab", () => {
    expect(oklchToOklab({ l: 50, c: 0, h: 260 })).toEqual({
      space: "oklab",
      l: 0.5,
      a: 0,
      b: 0,
      alpha: 1,
    });
  });

  it("round-trips OKLCH through OKLab within tolerance", () => {
    const source = { l: 63.5, c: 0.142, h: 278.4, alpha: 0.72 };
    const result = oklabToOklch(oklchToOklab(source));

    expectCloseTo(result.l, source.l);
    expectCloseTo(result.c, source.c);
    expectCloseTo(result.h, source.h);
    expectCloseTo(result.alpha, source.alpha);
  });

  it("preserves alpha across OKLCH and OKLab conversions", () => {
    expect(oklchToOklab({ l: 50, c: 0.1, h: 30, alpha: 0.42 }).alpha).toBe(0.42);
    expect(oklabToOklch({ l: 0.5, a: 0.1, b: 0.2, alpha: 0.42 }).alpha).toBe(0.42);
  });

  it("rejects non-finite OKLab channels", () => {
    expect(() => oklabToOklch({ l: Number.NaN, a: 0, b: 0 })).toThrow(
      "OKLab l must be a finite number.",
    );
    expect(() => oklabToOklch({ l: 0.5, a: Number.POSITIVE_INFINITY, b: 0 })).toThrow(
      "OKLab a must be a finite number.",
    );
    expect(() => oklabToOklch({ l: 0.5, a: 0, b: Number.NEGATIVE_INFINITY })).toThrow(
      "OKLab b must be a finite number.",
    );
  });
});

describe("OKLab and linear RGB conversions", () => {
  it("round-trips OKLab through linear RGB within tolerance", () => {
    const source = { l: 0.64, a: 0.08, b: -0.12, alpha: 0.8 };
    const result = linearRgbToOklab(oklabToLinearRgb(source));

    expectCloseTo(result.l, source.l);
    expectCloseTo(result.a, source.a);
    expectCloseTo(result.b, source.b);
    expectCloseTo(result.alpha, source.alpha);
  });

  it("preserves alpha across OKLab and linear RGB conversions", () => {
    expect(oklabToLinearRgb({ l: 0.5, a: 0.1, b: 0.2, alpha: 0.31 }).alpha).toBe(0.31);
    expect(linearRgbToOklab({ r: 0.2, g: 0.3, b: 0.4, alpha: 0.31 }).alpha).toBe(0.31);
  });

  it("allows out-of-gamut linear RGB channels", () => {
    const result = linearRgbToOklab({ r: -0.1, g: 1.2, b: 0.5 });

    expect(result.space).toBe("oklab");
    expect(Number.isFinite(result.l)).toBe(true);
    expect(Number.isFinite(result.a)).toBe(true);
    expect(Number.isFinite(result.b)).toBe(true);
  });

  it("rejects non-finite linear RGB channels", () => {
    expect(() => linearRgbToOklab({ r: Number.NaN, g: 0, b: 0 })).toThrow(
      "linear RGB r must be a finite number.",
    );
    expect(() => linearRgbToOklab({ r: 0, g: Number.POSITIVE_INFINITY, b: 0 })).toThrow(
      "linear RGB g must be a finite number.",
    );
    expect(() => linearRgbToOklab({ r: 0, g: 0, b: Number.NEGATIVE_INFINITY })).toThrow(
      "linear RGB b must be a finite number.",
    );
  });
});

describe("precision handling", () => {
  it("normalizes near-zero conversion noise", () => {
    const result = oklchToOklab({ l: 50, c: CONVERSION_EPSILON / 2, h: 90 });

    expect(result.a).toBe(0);
    expect(result.b).toBe(0);
    expect(Object.is(result.a, -0)).toBe(false);
    expect(Object.is(result.b, -0)).toBe(false);
  });
});
