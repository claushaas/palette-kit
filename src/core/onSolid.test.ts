import { converter } from "culori";
import { describe, expect, it } from "vitest";

import { computeApcaLc } from "../contrast/apca.js";
import type { OkLchColor } from "../engine/generateScale.js";
import { createTheme } from "./createTheme.js";

type SrgbColor = { r: number; g: number; b: number };

const toSrgb = converter("rgb");

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toSrgbColor = (color: OkLchColor): SrgbColor | null => {
  const rgb = toSrgb({ mode: "oklch", l: clamp(color.l, 0, 100) / 100, c: color.c, h: color.h });

  if (!rgb) {
    return null;
  }

  const r = typeof rgb.r === "number" && Number.isFinite(rgb.r) ? clamp(rgb.r, 0, 1) : 0;
  const g = typeof rgb.g === "number" && Number.isFinite(rgb.g) ? clamp(rgb.g, 0, 1) : 0;
  const b = typeof rgb.b === "number" && Number.isFinite(rgb.b) ? clamp(rgb.b, 0, 1) : 0;

  return { r, g, b };
};

const blend = (fg: SrgbColor, bg: SrgbColor, alpha: number): SrgbColor => ({
  r: fg.r * alpha + bg.r * (1 - alpha),
  g: fg.g * alpha + bg.g * (1 - alpha),
  b: fg.b * alpha + bg.b * (1 - alpha),
});

const passesApca = (fg: OkLchColor, bg: OkLchColor, targetLc: number, alpha = 1) => {
  const fgSrgb = toSrgbColor(fg);
  const bgSrgb = toSrgbColor(bg);

  if (!fgSrgb || !bgSrgb) {
    return false;
  }

  const composite = blend(fgSrgb, bgSrgb, alpha);
  const value = Math.abs(computeApcaLc(composite, bgSrgb));
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

  it("keeps alpha at 1 when mode is none", () => {
    const result = theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "dark",
      alpha: { mode: "none" },
    });

    expect(result.oklch.alpha).toBe(1);
  });
});
