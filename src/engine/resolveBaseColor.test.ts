import { describe, expect, it } from "vitest";

import { parseColor } from "../utils/parseColor.js";
import type { ColorQuery } from "../types/index.js";
import { normalizeQuery } from "./normalize.js";
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
  const r = (query: ColorQuery) => resolveBaseColor(normalizeQuery(query), themeConfig);

  it("defaults action roles to accent when variant is missing", () => {
    const result = r({
      role: "action.primary",
      usage: "bg",
      surface: "solid",
      context: "light",
    });

    expect(result.variantUsed).toBe("accent");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.accent);
  });

  it("defaults text roles to neutral when variant is missing", () => {
    const result = r({
      role: "text.primary",
      usage: "text",
      surface: "surface",
      context: "light",
    });

    expect(result.variantUsed).toBe("neutral");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.neutral);
  });

  it("uses custom category variants when provided", () => {
    const result = r({
      role: "bg.category",
      variant: "category:food",
      usage: "bg",
      surface: "surface",
      context: "light",
    });

    expect(result.variantUsed).toBe("category:food");
    expect(result.seedUsed).toBe(themeConfig.variants["category:food"]);
  });

  it("falls back to accent for missing category variants", () => {
    const result = r({
      role: "bg.category",
      variant: "category:missing",
      usage: "bg",
      surface: "surface",
      context: "light",
    });

    expect(result.variantUsed).toBe("accent");
    expect(result.seedUsed).toBe(themeConfig.seeds.light.accent);
  });

  it("chooses steps based on usage and surface", () => {
    const appBg = r({ role: "bg.app", usage: "bg", surface: "app", context: "light" });
    const solidBg = r({ role: "bg.solid", usage: "bg", surface: "solid", context: "light" });
    const borderSurface = r({
      role: "border.surface",
      usage: "border",
      surface: "surface",
      context: "light",
    });
    const ring = r({ role: "ring.focus", usage: "ring", surface: "surface", context: "light" });

    expect(appBg.step).toBe(1);
    expect(solidBg.step).toBe(9);
    expect(borderSurface.step).toBe(6);
    expect(ring.step).toBe(8);
  });

  it("returns valid OKLCH values with stable hue", () => {
    const result = r({
      role: "action.primary",
      usage: "bg",
      surface: "solid",
      context: "light",
    });
    const seed = parseColor(themeConfig.seeds.light.accent);

    expect(result.oklch.l).toBeGreaterThanOrEqual(0);
    expect(result.oklch.l).toBeLessThanOrEqual(100);
    expect(result.oklch.c).toBeGreaterThanOrEqual(0);
    expect(result.oklch.h).toBeCloseTo(seed.okLch.channels[2], 6);
  });

  it("accepts normalized queries without re-normalizing", () => {
    const normalized = normalizeQuery({
      role: "text.secondary",
      usage: "text",
      surface: "surface",
      context: "dark",
    });

    const result = resolveBaseColor(normalized, themeConfig);

    expect(result.step).toBe(11);
  });
});
