import { onSolid } from "../engine/onSolid.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import type { ColorContext, ColorQuery, ColorRole, OnSolidQuery } from "../types/index.js";
import { resolve } from "./resolve.js";

export type PaletteTheme = {
  resolve: (query: ColorQuery) => BaseResolvedColor;
  color: (role: ColorRole, options?: Omit<ColorQuery, "role">) => BaseResolvedColor;
  onSolid: (query: OnSolidQuery) => BaseResolvedColor;
  withContext: (context: ColorContext) => PaletteTheme;
};

export function createTheme(config: ThemeConfig): PaletteTheme {
  const themeConfig: ThemeConfig = {
    ...config,
    preset: config.preset ?? "modern",
    variants: config.variants ?? {},
  };

  const buildTheme = (boundContext?: ColorContext): PaletteTheme => ({
    resolve: (query) =>
      resolve(boundContext ? { context: boundContext, ...query } : query, themeConfig),
    color: (role, options) =>
      resolve(
        {
          role,
          ...(boundContext ? { context: boundContext } : {}),
          ...(options ?? {}),
        },
        themeConfig,
      ),
    onSolid: (query) =>
      onSolid(boundContext ? { context: boundContext, ...query } : query, themeConfig),
    withContext: (context) => buildTheme(context),
  });

  return buildTheme();
}
