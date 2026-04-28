import { describe, expect, it } from "vitest";

import { assertLevel, isLevel, LEVELS } from "./level.js";

const invalidLevelError = 'Invalid level "0". Expected an integer from 1 to 9.';

describe("level validation", () => {
  it("accepts canonical levels", () => {
    for (const level of LEVELS) {
      expect(isLevel(level)).toBe(true);
      expect(() => assertLevel(level)).not.toThrow();
    }
  });

  it("rejects values outside the level range", () => {
    expect(isLevel(0)).toBe(false);
    expect(isLevel(10)).toBe(false);
    expect(isLevel(-1)).toBe(false);
  });

  it("rejects non-integer and non-finite numbers", () => {
    expect(isLevel(1.5)).toBe(false);
    expect(isLevel(Number.NaN)).toBe(false);
    expect(isLevel(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("rejects non-number values", () => {
    expect(isLevel("1")).toBe(false);
    expect(isLevel({ level: 1 })).toBe(false);
  });

  it("throws a clear error for invalid levels", () => {
    expect(() => assertLevel(0)).toThrow(invalidLevelError);
  });

  it("freezes the canonical level list", () => {
    expect(Object.isFrozen(LEVELS)).toBe(true);
  });
});
