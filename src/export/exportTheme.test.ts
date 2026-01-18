import { describe, expect, it, vi } from "vitest";

import { createTheme } from "../core/createTheme.js";
import * as gamut from "../engine/gamut.js";
import { exportThemeCss, exportThemeJson, type ThemeTokens } from "./exportTheme.js";

type ExportFixture = {
  resolve: ReturnType<typeof createTheme>["resolve"];
  tokens: ThemeTokens;
};

const buildTheme = (): ExportFixture => {
  const theme = createTheme({
    seeds: {
      light: { neutral: "#111827", accent: "#3d63dd" },
      dark: { neutral: "#111827", accent: "#3d63dd" },
    },
  });

  const tokens: ThemeTokens = {
    "text.primary": {
      usage: "text",
      surface: "surface",
      emphasis: "default",
    },
    "bg.app": {
      usage: "bg",
      surface: "app",
    },
    "custom.alias": {
      role: "text.primary",
      usage: "text",
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

    expect(() => exportThemeCss(theme, {})).toThrow(/Theme tokens are required for export/i);
    expect(() => exportThemeJson(theme, {})).toThrow(/Theme tokens are required for export/i);
  });

  it("exports deterministic CSS with @supports overrides", () => {
    const theme = buildTheme();
    const { css } = exportThemeCss(theme, theme.tokens, {
      preferSpace: "oklch",
      includeSpaces: ["p3", "oklch"],
    });

    expect(css).toMatchSnapshot();
  });

  it("includes meta when requested and omits when not", () => {
    const theme = buildTheme();

    const withMeta = exportThemeJson(theme, theme.tokens, { includeMeta: true });
    expect(withMeta.tokens.light["bg.app"].meta?.gamutMapping).toBe("preferP3ThenCompress");
    expect(withMeta.meta).toEqual({
      gamutMapping: "preferP3ThenCompress",
      preferSpace: "oklch",
      includeSpaces: [],
      precision: { l: 1, c: 3, h: 1, alpha: 2 },
      strict: false,
    });

    const withoutMeta = exportThemeJson(theme, theme.tokens, { includeMeta: false });
    expect(withoutMeta.tokens.light["bg.app"].meta).toBeUndefined();
  });

  it("includes export meta for CSS when requested", () => {
    const theme = buildTheme();
    const { meta } = exportThemeCss(theme, theme.tokens, { includeMeta: true });

    expect(meta).toEqual({
      gamutMapping: "preferP3ThenCompress",
      preferSpace: "oklch",
      includeSpaces: [],
      precision: { l: 1, c: 3, h: 1, alpha: 2 },
      strict: false,
    });
  });

  it("exports deterministic JSON with light/dark contexts", () => {
    const theme = buildTheme();
    const { tokens } = exportThemeJson(theme, theme.tokens, {
      preferSpace: "oklch",
      includeSpaces: ["srgb"],
    });

    expect(tokens).toMatchSnapshot();
  });

  it("keeps ordering stable regardless of token map order", () => {
    const theme = buildTheme();
    const shuffled: ThemeTokens = {
      "custom.alias": theme.tokens["custom.alias"],
      "bg.app": theme.tokens["bg.app"],
      "text.primary": theme.tokens["text.primary"],
    };

    const cssA = exportThemeCss(theme, theme.tokens, { preferSpace: "oklch" }).css;
    const cssB = exportThemeCss(theme, shuffled, { preferSpace: "oklch" }).css;
    const jsonA = exportThemeJson(theme, theme.tokens, { preferSpace: "oklch" }).tokens;
    const jsonB = exportThemeJson(theme, shuffled, { preferSpace: "oklch" }).tokens;

    expect(cssA).toBe(cssB);
    expect(jsonA).toEqual(jsonB);
  });

  it("throws when strict preferred space cannot be serialized", () => {
    const theme = buildTheme();
    const original = gamut.toGamutRgb;
    const spy = vi
      .spyOn(gamut, "toGamutRgb")
      .mockImplementation((color, target) => (target === "p3" ? null : original(color, target)));

    try {
      expect(() =>
        exportThemeCss(theme, theme.tokens, {
          preferSpace: "p3",
          includeSpaces: ["p3"],
          strict: true,
        }),
      ).toThrow(/Unable to serialize preferred space: p3/i);
    } finally {
      spy.mockRestore();
    }
  });
});
