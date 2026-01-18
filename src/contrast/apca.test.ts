import { describe, expect, it } from "vitest";

import { computeApcaLc } from "./apca.js";

describe("computeApcaLc", () => {
  it("reports high magnitude for black on white", () => {
    const lc = computeApcaLc({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 });
    expect(Math.abs(lc)).toBeGreaterThan(60);
  });

  it("reports high magnitude for white on black", () => {
    const lc = computeApcaLc({ r: 1, g: 1, b: 1 }, { r: 0, g: 0, b: 0 });
    expect(Math.abs(lc)).toBeGreaterThan(60);
  });

  it("does not return NaN", () => {
    const lc = computeApcaLc({ r: 0.2, g: 0.4, b: 0.6 }, { r: 0.1, g: 0.1, b: 0.1 });
    expect(Number.isNaN(lc)).toBe(false);
  });
});
