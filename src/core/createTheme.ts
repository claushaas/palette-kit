import { onSolid } from "../engine/onSolid.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { serializeResolved } from "../serialize/serializeColor.js";
import type {
  ColorContext,
  ColorQuery,
  ColorRole,
  ColorUsage,
  OnSolidQuery,
  OutputOptions,
  ResolvedColor,
  SurfaceIntent,
} from "../types/index.js";
import { resolve } from "./resolve.js";
import { resolveMany } from "./resolveMany.js";

const inferUsageFromRole = (role: string): ColorUsage | undefined => {
  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole.startsWith("bg.")) return "bg";
  if (normalizedRole.startsWith("text.")) return "text";
  if (normalizedRole.startsWith("icon.")) return "icon";
  if (normalizedRole.startsWith("border.")) return "border";
  if (normalizedRole.startsWith("ring.")) return "ring";

  return undefined;
};

const inferSurfaceFromRole = (role: string): SurfaceIntent | undefined => {
  const normalizedRole = role.trim().toLowerCase();
  const tokens = normalizedRole.split(".");
  const surfaces: SurfaceIntent[] = [
    "app",
    "surface",
    "subtle",
    "solid",
    "overlay",
    "data",
    "transparent",
  ];

  const [first, second] = tokens;

  if (first && surfaces.includes(first as SurfaceIntent)) {
    return first as SurfaceIntent;
  }

  if (first === "bg" && second && surfaces.includes(second as SurfaceIntent)) {
    return second as SurfaceIntent;
  }

  return undefined;
};

const inferColorQuery = (
  role: ColorRole,
  options: Omit<ColorQuery, "role"> | undefined,
): ColorQuery => {
  const strict = options?.output?.strict ?? false;
  const usage = options?.usage ?? inferUsageFromRole(role);
  const surface = options?.surface ?? inferSurfaceFromRole(role);

  if (!usage) {
    if (strict) {
      throw new Error(`Usage is required for role: "${role}"`);
    }
  }

  if (!surface) {
    if (strict) {
      throw new Error(`Surface is required for role: "${role}"`);
    }
  }

  return {
    role,
    ...options,
    usage: usage ?? "bg",
    surface: surface ?? "surface",
  };
};

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
   * Resolve a color role with optional inference for usage, surface, and variant.
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
    color: (role, options) => {
      const query = inferColorQuery(role, options);
      return resolve(applyBoundContext(query, boundContext), themeConfig);
    },
    onSolid: (query) => onSolid(applyBoundContext(query, boundContext), themeConfig),
    serialize: (query, options) => {
      const resolved = resolve(applyBoundContext(query, boundContext), themeConfig);
      return serializeResolved(resolved, options);
    },
    withContext: (context) => buildTheme(context),
  });

  return buildTheme();
}
