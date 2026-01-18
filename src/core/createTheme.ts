import { onSolid } from "../engine/onSolid.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { serializeResolved } from "../serialize/serializeColor.js";
import type {
  ColorContext,
  ColorQuery,
  ColorRole,
  OnSolidQuery,
  OutputOptions,
  ResolvedColor,
} from "../types/index.js";
import { resolve } from "./resolve.js";
import { resolveMany } from "./resolveMany.js";

export type PaletteTheme = {
  /**
   * Resolve a single color query to the core OKLCH output shape.
   */
  resolve: (query: ColorQuery) => BaseResolvedColor;
  /**
   * Resolve a batch of color queries while preserving input order.
   */
  resolveMany: (queries: ColorQuery[]) => BaseResolvedColor[];
  /**
   * Resolve a color role with inference and DX validation.
   *
   * Inference and strict/non-strict behavior is shared with `theme.resolve(...)` and is
   * implemented inside query normalization.
   *
   * When `output.strict` is true, missing inference throws an error; otherwise
   * safe defaults are used.
   */
  color: (role: ColorRole, options?: Omit<ColorQuery, "role">) => BaseResolvedColor;
  /**
   * Resolve a foreground color against a solid background (APCA/WCAG aware).
   */
  onSolid: (query: OnSolidQuery) => BaseResolvedColor;
  /**
   * Serialize a resolved color query for external outputs (CSS, RN, JSON, etc.).
   */
  serialize: (query: ColorQuery, options?: OutputOptions) => ResolvedColor;
  /**
   * Return a new theme instance with a bound context.
   */
  withContext: (context: ColorContext) => PaletteTheme;
};

export function createTheme(config: ThemeConfig): PaletteTheme {
  const themeConfig: ThemeConfig = {
    ...config,
    preset: config.preset ?? "modern",
    variants: config.variants ?? {},
  };

  const applyBoundContext = <T extends { context?: ColorContext }>(
    query: T,
    boundContext?: ColorContext,
  ) => (boundContext ? { context: boundContext, ...query } : query);

  const buildTheme = (boundContext?: ColorContext): PaletteTheme => ({
    resolve: (query) => resolve(applyBoundContext(query, boundContext), themeConfig),
    resolveMany: (queries) =>
      resolveMany(
        queries.map((query) => applyBoundContext(query, boundContext)),
        themeConfig,
      ),
    color: (role, options) =>
      resolve(applyBoundContext({ role, ...(options ?? {}) }, boundContext), themeConfig),
    onSolid: (query) => onSolid(applyBoundContext(query, boundContext), themeConfig),
    serialize: (query, options) => {
      const resolved = resolve(applyBoundContext(query, boundContext), themeConfig);
      return serializeResolved(resolved, options);
    },
    withContext: (context) => buildTheme(context),
  });

  return buildTheme();
}
