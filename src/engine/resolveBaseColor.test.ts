import { describe, expect, it } from "vitest";

import { parseColor } from "../utils/parseColor.js";
import { resolveBaseColor } from "./resolveBaseColor.js";

const themeConfig = {
  seeds: {
    light: { neutral: "#8B8D98", accent: "#3D63DD" },
    dark: { neutral: "#8B8D98", accent: "#3D63DD" },
  },
  variants: {
    "category:food": "#C2410C",
  },
  preset: "modern",
};

describe("resolveBaseColor", () => {
  it("defaults action roles to accent when variant is missing", () => {
    const result = resolveBaseColor(
      { role: "action.primary", usage: "bg", surface: "solid", context: "light" },
      themeConfig,
    );

    expect(result.variantUsed).toBe("accent");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.accent);
  });

  it("defaults text roles to neutral when variant is missing", () => {
    const result = resolveBaseColor(
      { role: "text.primary", usage: "text", surface: "surface", context: "light" },
      themeConfig,
    );

    expect(result.variantUsed).toBe("neutral");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.neutral);
  });

  it("uses custom category variants when provided", () => {
    const result = resolveBaseColor(
      {
        role: "bg.category",
        variant: "category:food",
        usage: "bg",
        surface: "surface",
        context: "light",
      },
      themeConfig,
    );

    expect(result.variantUsed).toBe("category:food");
    expect(result.seedUsed).toBe(themeConfig.variants["category:food"]);
  });

  it("falls back to accent for missing category variants", () => {
    const result = resolveBaseColor(
      {
        role: "bg.category",
        variant: "category:missing",
        usage: "bg",
        surface: "surface",
        context: "light",
      },
      themeConfig,
    );

    expect(result.variantUsed).toBe("accent");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.accent);
  });

  it("chooses steps based on usage and surface", () => {
    const appBg = resolveBaseColor(
      { role: "bg.app", usage: "bg", surface: "app", context: "light" },
      themeConfig,
    );
    const solidBg = resolveBaseColor(
      { role: "bg.solid", usage: "bg", surface: "solid", context: "light" },
      themeConfig,
    );
    const borderSurface = resolveBaseColor(
      { role: "border.surface", usage: "border", surface: "surface", context: "light" },
      themeConfig,
    );
    const ring = resolveBaseColor(
      { role: "ring.focus", usage: "ring", surface: "surface", context: "light" },
      themeConfig,
    );

    expect(appBg.step).toBe(1);
    expect(solidBg.step).toBe(9);
    expect(borderSurface.step).toBe(6);
    expect(ring.step).toBe(8);
  });

  it("returns valid OKLCH values with stable hue", () => {
    const result = resolveBaseColor(
      { role: "action.primary", usage: "bg", surface: "solid", context: "light" },
      themeConfig,
    );
    const seed = parseColor(themeConfig.seeds.light.accent);

    expect(result.oklch.l).toBeGreaterThanOrEqual(0);
    expect(result.oklch.l).toBeLessThanOrEqual(100);
    expect(result.oklch.c).toBeGreaterThanOrEqual(0);
    expect(result.oklch.h).toBeCloseTo(seed.okLch.channels[2], 6);
  });
});
