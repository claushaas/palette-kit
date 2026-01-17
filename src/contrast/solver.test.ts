import { describe, expect, it } from "vitest";

import { parseColor } from "../utils/parseColor.js";
import { solveContrast } from "./solver.js";

const toOkLch = (hex: string) => {
  const parsed = parseColor(hex);
  return {
    l: parsed.okLch.channels[0] * 100,
    c: parsed.okLch.channels[1],
    h: parsed.okLch.channels[2],
    alpha: parsed.okLch.alpha,
  };
};

describe("solveContrast", () => {
  it("raises contrast on light backgrounds", () => {
    const fg = toOkLch("#777777");
    const bg = toOkLch("#ffffff");

    const result = solveContrast(
      fg,
      bg,
      { model: "wcag2", minRatio: 4.5 },
      { surface: "surface", context: "light" },
    );

    expect(result.result.pass).toBe(true);
    expect(result.result.value).toBeGreaterThanOrEqual(4.5);
    expect(result.color.l).toBeGreaterThanOrEqual(0);
    expect(result.color.l).toBeLessThanOrEqual(100);
    expect(result.color.c).toBeGreaterThanOrEqual(0);
  });

  it("returns original color when contrast model is none", () => {
    const fg = toOkLch("#777777");
    const bg = toOkLch("#ffffff");

    const result = solveContrast(
      fg,
      bg,
      { model: "none" },
      { surface: "surface", context: "light" },
    );

    expect(result.result.pass).toBe(true);
    expect(result.iterations).toBe(0);
    expect(result.color).toEqual(fg);
  });

  it("skips when background is missing and strict is false", () => {
    const fg = toOkLch("#777777");

    const result = solveContrast(
      fg,
      undefined,
      { model: "wcag2", minRatio: 4.5 },
      { surface: "surface", context: "light" },
      { strict: false },
    );

    expect(result.result.pass).toBe(false);
    expect(Number.isNaN(result.result.value)).toBe(true);
  });

  it("throws when background is missing and strict is true", () => {
    const fg = toOkLch("#777777");

    expect(() =>
      solveContrast(
        fg,
        undefined,
        { model: "wcag2", minRatio: 4.5 },
        { surface: "surface", context: "light" },
        { strict: true },
      ),
    ).toThrowError(/requires background/i);
  });

  it("raises contrast on dark backgrounds", () => {
    const fg = toOkLch("#777777");
    const bg = toOkLch("#111111");

    const result = solveContrast(
      fg,
      bg,
      { model: "wcag2", minRatio: 4.5 },
      { surface: "surface", context: "dark" },
    );

    expect(result.result.pass).toBe(true);
    expect(result.result.value).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps hue stable", () => {
    const fg = toOkLch("#3366ff");
    const bg = toOkLch("#ffffff");

    const result = solveContrast(
      fg,
      bg,
      { model: "wcag2", minRatio: 4.5 },
      { surface: "surface", context: "light" },
    );

    expect(result.color.h).toBeCloseTo(fg.h, 6);
  });

  it("throws in strict mode when target is unattainable", () => {
    const fg = toOkLch("#ffffff");
    const bg = toOkLch("#ffffff");

    expect(() =>
      solveContrast(
        fg,
        bg,
        { model: "wcag2", minRatio: 30 },
        { surface: "surface", context: "light" },
        { strict: true },
      ),
    ).toThrowError(/contrast solver failed/i);
  });

  it("prefers APCA values closer to target within the allowed range", () => {
    const fg = toOkLch("#777777");
    const bg = toOkLch("#ffffff");
    const minLc = 50;
    const maxLc = 80;
    const targetLc = 60;

    const result = solveContrast(
      fg,
      bg,
      { model: "apca", targetLc, minLc, maxLc },
      { surface: "surface", context: "light" },
    );

    const value = result.result.value;
    const targetDistance = Math.abs(value - targetLc);
    const maxDistance = Math.abs(maxLc - targetLc);

    expect(result.result.pass).toBe(true);
    expect(value).toBeGreaterThanOrEqual(minLc);
    expect(value).toBeLessThanOrEqual(maxLc);
    expect(targetDistance).toBeLessThanOrEqual(maxDistance);
  });
});
