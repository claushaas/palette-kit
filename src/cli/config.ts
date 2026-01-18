import type { ThemeConfig } from "../engine/resolveBaseColor.js";
import type { OutputOptions } from "../types/index.js";

/**
 * Official token preset names supported by Palette Kit tooling.
 *
 * These map to `src/presets/tokens/*` registries.
 */
export type TokenPresetName = "minimal-ui" | "radixLike-ui" | "modern-ui";

/**
 * Configuration contract for `palette-kit build`.
 *
 * This file is consumed by the CLI and is intended to be used from
 * `palette.config.ts` created by `palette-kit init`.
 */
export type PaletteConfig = {
  /**
   * Theme inputs for palette generation (seed colors + optional variants).
   */
  theme: ThemeConfig;
  /**
   * Token preset selection for exporters/CLI.
   */
  tokens: {
    preset: TokenPresetName;
  };
  /**
   * Exporter options (formatting, gamut mapping, precision).
   */
  output?: OutputOptions;
};

/**
 * Build a `palette.config.ts` template for `palette-kit init`.
 *
 * @param packageName - Import path used for `PaletteConfig` typing (usually the package name).
 */
export const buildConfigTemplate = (
  packageName: string,
) => `import type { PaletteConfig } from "${packageName}";

/**
 * Palette Kit configuration.
 * Update seeds, preset, and output options to match your design system.
 */
const config: PaletteConfig = {
  theme: {
    seeds: {
      light: { neutral: "#8B8D98", accent: "#3D63DD" },
      dark: { neutral: "#8B8D98", accent: "#3D63DD" },
    },
    preset: "modern",
  },
  tokens: {
    preset: "modern-ui",
  },
  output: {
    preferSpace: "oklch",
    includeSpaces: ["srgb", "p3"],
  },
};

export default config;
`;

/**
 * Runtime guard for token preset strings coming from user config.
 */
export const isTokenPresetName = (value: string): value is TokenPresetName =>
  value === "minimal-ui" || value === "radixLike-ui" || value === "modern-ui";
