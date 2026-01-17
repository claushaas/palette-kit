import { describe, expect, it, vi } from "vitest";

import * as apca from "../contrast/apca.js";
import { blendSrgb, toSrgbColor } from "../contrast/utils.js";
import type { OkLchColor } from "../engine/generateScale.js";
import * as operators from "../engine/applyOperators.js";
import { createTheme } from "./createTheme.js";

const passesApca = (fg: OkLchColor, bg: OkLchColor, targetLc: number, alpha = 1) => {
  const fgSrgb = toSrgbColor(fg);
  const bgSrgb = toSrgbColor(bg);

  if (!fgSrgb || !bgSrgb) {
    return false;
  }

  const composite = blendSrgb(fgSrgb, bgSrgb, alpha);
  const value = Math.abs(apca.computeApcaLc(composite, bgSrgb));
  return value >= targetLc;
};

const theme = createTheme({
  seeds: {
    light: { neutral: "#8B8D98", accent: "#3D63DD" },
    dark: { neutral: "#8B8D98", accent: "#3D63DD" },
  },
  preset: "modern",
});

describe("onSolid", () => {
  it("chooses a white-ish foreground on dark solids", () => {
    const bg = theme.resolve({
      role: "action.primary",
      usage: "bg",
      surface: "solid",
      context: "dark",
    });
    const result = theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "dark",
    });

    expect(bg.oklch.l).toBeLessThan(50);
    expect(result.oklch.l).toBeGreaterThan(50);
    expect(passesApca(result.oklch, bg.oklch, 75, result.oklch.alpha ?? 1)).toBe(true);
  });

  it("chooses a black-ish foreground on light solids", () => {
    const bg = theme.resolve({
      role: "action.primary",
      usage: "bg",
      surface: "solid",
      context: "light",
    });
    const result = theme.onSolid({
      bgRole: "action.primary",
      usage: "icon",
      context: "light",
    });

    expect(bg.oklch.l).toBeGreaterThanOrEqual(50);
    expect(result.oklch.l).toBeLessThan(50);
    expect(passesApca(result.oklch, bg.oklch, 60, result.oklch.alpha ?? 1)).toBe(true);
  });

  it("raises alpha to 1 when needed for contrast", () => {
    const bg = theme.resolve({
      role: "action.primary",
      usage: "bg",
      surface: "solid",
      context: "dark",
    });
    const result = theme.onSolid({
      bgRole: "action.primary",
      usage: "icon",
      context: "dark",
      contrast: { model: "apca", targetLc: 90 },
    });

    expect(result.oklch.alpha).toBe(1);
    expect(passesApca(result.oklch, bg.oklch, 90, 1)).toBe(true);
    expect(passesApca(result.oklch, bg.oklch, 90, 0.72)).toBe(false);
  });

  it("throws in strict mode when contrast is impossible", () => {
    expect(() =>
      theme.onSolid({
        bgRole: "action.primary",
        usage: "text",
        context: "light",
        contrast: { model: "apca", targetLc: 140 },
        output: { strict: true },
      }),
    ).toThrow(/onSolid contrast failed|Contrast solver failed/i);
  });

  it("accepts results within epsilon for strict checks", () => {
    const spy = vi.spyOn(apca, "computeApcaLc").mockImplementation(() => 74.995);

    try {
      expect(() =>
        theme.onSolid({
          bgRole: "action.primary",
          usage: "text",
          context: "light",
          contrast: { model: "apca", targetLc: 75 },
          output: { strict: true },
        }),
      ).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });

  it("keeps alpha at 1 when mode is none", () => {
    const result = theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "dark",
      alpha: { mode: "none" },
    });

    expect(result.oklch.alpha).toBe(1);
  });

  it("applies state and emphasis to the background before solving", () => {
    const spy = vi.spyOn(operators, "applyOperators");

    theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "light",
      state: "hover",
      emphasis: "strong",
    });

    expect(spy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ state: "hover", emphasis: "strong" }),
      expect.any(Object),
    );

    spy.mockRestore();
  });
});
