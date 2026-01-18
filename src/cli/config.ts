import type { ThemeConfig } from "../engine/resolveBaseColor.js";
import type { OutputOptions } from "../types/index.js";

export type TokenPresetName = "minimal-ui" | "radixLike-ui" | "modern-ui";

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

export const isTokenPresetName = (value: string): value is TokenPresetName =>
  value === "minimal-ui" || value === "radixLike-ui" || value === "modern-ui";
