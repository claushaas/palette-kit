import { describe, expect, it, vi } from "vitest";

import { createTheme } from "../core/createTheme.js";
import * as gamut from "../engine/gamut.js";
import { exportThemeCss, exportThemeJson, type ThemeTokens } from "./exportTheme.js";

const buildTheme = () => {
  const theme = createTheme({
    seeds: {
      light: { neutral: "#111827", accent: "#3d63dd" },
      dark: { neutral: "#111827", accent: "#3d63dd" },
    },
  });

  const tokens: ThemeTokens = {
    "text.primary": {
      usage: "text",
      context: "light",
      surface: "surface",
      emphasis: "default",
    },
    "bg.app": {
      usage: "bg",
      context: "light",
      surface: "app",
    },
    "custom.alias": {
      role: "text.primary",
      usage: "text",
      context: "light",
      surface: "surface",
    },
  };

  return {
    resolve: theme.resolve.bind(theme),
    tokens,
  };
};

describe("exportTheme", () => {
  it("throws when theme tokens are missing", () => {
    const theme = createTheme({
      seeds: {
        light: { neutral: "#111827", accent: "#3d63dd" },
        dark: { neutral: "#111827", accent: "#3d63dd" },
      },
    });

    const exportable = { resolve: theme.resolve.bind(theme), tokens: {} };

    expect(() => exportThemeCss(exportable)).toThrow(/Theme tokens are required for export/i);
    expect(() => exportThemeJson(exportable)).toThrow(/Theme tokens are required for export/i);
  });

  it("exports CSS vars with prefix and deterministic ordering", () => {
    const theme = buildTheme();
    const { css } = exportThemeCss(theme, { preferSpace: "oklch" });

    expect(css.includes("--pk-bg-app:")).toBe(true);
    expect(css.includes("--pk-text-primary:")).toBe(true);
    expect(css.includes("--pk-custom-alias:")).toBe(true);
    expect(css.indexOf("--pk-bg-app:")).toBeLessThan(css.indexOf("--pk-text-primary:"));
    expect(css.endsWith("\n")).toBe(true);
  });

  it("adds includeSpaces suffixes in CSS export", () => {
    const theme = buildTheme();
    const { css } = exportThemeCss(theme, {
      preferSpace: "oklch",
      includeSpaces: ["srgb", "p3", "oklch"],
    });

    expect(css.includes("--pk-bg-app-srgb:")).toBe(true);
    expect(css.includes("--pk-bg-app-p3:")).toBe(true);
    expect(css.includes("--pk-bg-app-oklch:")).toBe(true);
  });

  it("exports JSON tokens with preferred space and extras", () => {
    const theme = buildTheme();
    const { tokens } = exportThemeJson(theme, {
      preferSpace: "p3",
      includeSpaces: ["srgb", "oklch"],
    });

    expect(tokens["bg.app"].value.space).toBe("p3");
    expect(tokens["bg.app"].srgb?.space).toBe("srgb");
    expect(tokens["bg.app"].oklch?.space).toBe("oklch");
  });

  it("includes meta when requested and omits when not", () => {
    const theme = buildTheme();
    const withMeta = exportThemeJson(theme, { includeMeta: true });
    expect(withMeta.tokens["bg.app"].meta?.gamutMapping).toBe("preferP3ThenCompress");
    expect(withMeta.meta).toEqual({
      gamutMapping: "preferP3ThenCompress",
      preferSpace: "oklch",
      includeSpaces: [],
      precision: { l: 1, c: 3, h: 1, alpha: 2 },
      strict: false,
    });

    const withoutMeta = exportThemeJson(theme, { includeMeta: false });
    expect(withoutMeta.tokens["bg.app"].meta).toBeUndefined();
  });

  it("includes export meta for CSS when requested", () => {
    const theme = buildTheme();
    const { meta } = exportThemeCss(theme, { includeMeta: true });

    expect(meta).toEqual({
      gamutMapping: "preferP3ThenCompress",
      preferSpace: "oklch",
      includeSpaces: [],
      precision: { l: 1, c: 3, h: 1, alpha: 2 },
      strict: false,
    });
  });

  it("throws when strict preferred space cannot be serialized", () => {
    const theme = buildTheme();
    const spy = vi.spyOn(gamut, "toGamutRgb").mockReturnValue(null);

    try {
      expect(() =>
        exportThemeCss(theme, {
          preferSpace: "srgb",
          includeSpaces: ["srgb"],
          strict: true,
        }),
      ).toThrow(/Unable to serialize preferred space: srgb/i);
    } finally {
      spy.mockRestore();
    }
  });
});
