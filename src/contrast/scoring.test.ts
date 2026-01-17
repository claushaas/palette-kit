import { describe, expect, it } from "vitest";

import { scoreApca } from "./scoring.js";

describe("scoreApca", () => {
  it("prefers values closer to target within range", () => {
    const target = 60;
    const min = 50;
    const max = 80;
    const hasMax = true;

    expect(scoreApca(60, target, min, max, hasMax)).toBeGreaterThan(
      scoreApca(80, target, min, max, hasMax),
    );
  });

  it("penalizes values outside the range", () => {
    const target = 60;
    const min = 50;
    const max = 80;
    const hasMax = true;

    expect(scoreApca(40, target, min, max, hasMax)).toBeLessThan(0);
    expect(scoreApca(90, target, min, max, hasMax)).toBeLessThan(0);
  });

  it("penalizes below min and prefers target when no max", () => {
    const target = 60;
    const min = 50;
    const max = Number.POSITIVE_INFINITY;
    const hasMax = false;

    expect(scoreApca(40, target, min, max, hasMax)).toBeLessThan(
      scoreApca(55, target, min, max, hasMax),
    );
    expect(scoreApca(60, target, min, max, hasMax)).toBeGreaterThan(
      scoreApca(70, target, min, max, hasMax),
    );
  });
});
