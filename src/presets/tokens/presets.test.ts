import { describe, expect, it } from "vitest";

import { createTheme } from "../../core/createTheme.js";
import type { TokenRegistry } from "../../types/index.js";
import {
  minimalUiTokens,
  modernUiTokens,
  radixLikeUiTokens,
} from "./index.js";
import { validateTokenRegistry } from "../../core/tokenRegistry.js";
import { exportThemeCss, exportThemeJson } from "../../export/exportTheme.js";

const toThemeTokens = (registry: TokenRegistry) =>
  Object.fromEntries(
    Object.entries(registry.tokens).map(([name, token]) => [name, token.query]),
  );

describe("token presets", () => {
  const theme = createTheme({
    seeds: {
      light: { neutral: "#8B8D98", accent: "#3D63DD" },
      dark: { neutral: "#8B8D98", accent: "#3D63DD" },
    },
    preset: "modern",
  });

  it("validates all preset registries", () => {
    expect(() => validateTokenRegistry(minimalUiTokens)).not.toThrow();
    expect(() => validateTokenRegistry(radixLikeUiTokens)).not.toThrow();
    expect(() => validateTokenRegistry(modernUiTokens)).not.toThrow();
  });

  it("exports CSS/JSON for each preset", () => {
    const registries = [minimalUiTokens, radixLikeUiTokens, modernUiTokens];

    for (const registry of registries) {
      const exportable = {
        resolve: theme.resolve.bind(theme),
        tokens: toThemeTokens(registry),
      };
      const css = exportThemeCss(exportable, { preferSpace: "oklch" }).css;
      const json = exportThemeJson(exportable, { preferSpace: "oklch" }).tokens;

      expect(css.length).toBeGreaterThan(0);
      expect(Object.keys(json).length).toBeGreaterThan(0);
    }
  });
});
