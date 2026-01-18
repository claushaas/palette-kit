export type CssColorString = string;

export type ColorSpace = "srgb" | "p3" | "oklch";

export type ColorContext = "light" | "dark" | "highContrast" | "dimmed";

export type SurfaceIntent =
  | "app"
  | "surface"
  | "subtle"
  | "solid"
  | "overlay"
  | "data"
  | "transparent";

export type ColorState = "default" | "hover" | "active" | "selected" | "focus" | "disabled";

export type ColorEmphasis = "muted" | "subtle" | "default" | "strong" | "inverted";

export type SemanticVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "highlight"
  | "premium"
  | `category:${string}`
  | `chart:${string}`;

export type ColorRole = string;

export type ColorUsage = "bg" | "border" | "text" | "icon" | "ring" | "shadow" | "stroke" | "fill";

/**
 * Token-supported interactive states.
 *
 * Note: `"default"` is the base token, so it is intentionally excluded here.
 */
export type TokenState = Exclude<ColorState, "default">;

/**
 * Declarative set of supported states for a token.
 * Use `true` to mark a state as supported.
 */
export type TokenStates = Partial<Record<TokenState, true>>;

export type BackgroundHint =
  | { kind: "auto" }
  | { kind: "role"; role: ColorRole }
  | { kind: "color"; value: CssColorString };

export type ContrastRequirement =
  | { model: "apca"; targetLc: number; minLc?: number; maxLc?: number }
  | { model: "wcag2"; minRatio: number }
  | { model: "none" };

export type AlphaStrategy =
  | { mode: "none" }
  | { mode: "fixed"; alpha: number }
  | { mode: "solveOnBackground" };

export interface OutputOptions {
  preferSpace?: ColorSpace;
  includeSpaces?: ColorSpace[];
  gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress";
  strict?: boolean;
  precision?: {
    l?: number;
    c?: number;
    h?: number;
    alpha?: number;
  };
  includeMeta?: boolean;
  srgbFormat?: "hex" | "rgb" | "rgba";
}

export interface RawColor {
  space: ColorSpace;
  channels: number[];
  alpha: number;
}

export interface ColorMeta {
  role?: ColorRole;
  variant?: SemanticVariant;
  usage?: ColorUsage;
  context?: ColorContext;
  surface?: SurfaceIntent;
  state?: ColorState;
  emphasis?: ColorEmphasis;
  on?: BackgroundHint;
  contrast?: ContrastRequirement;
  step?: number;
  variantUsed?: string;
  seedUsed?: CssColorString;
  gamutMapping?: OutputOptions["gamutMapping"];
  spaceUsed?: ColorSpace;
  clipped?: boolean;
  compressed?: boolean;
  provenance?: string;
}

/**
 * Declarative token definition consumed by registries, exporters, CLI and codegen.
 *
 * Rules:
 * - Tokens never carry actual color values.
 * - `query.output` is forbidden; output formatting is decided by serializers/exporters.
 * - Do not encode interactive state in `query.state`; declare supported states via `states`.
 * - Do not embed literal background colors via `query.on: { kind: "color" }`.
 */
export interface TokenDefinition {
  name: string;
  description?: string;
  query: ColorQuery;
  category?: string;
  states?: TokenStates;
}

/**
 * Collection of base token definitions keyed by token name.
 */
export interface TokenRegistry {
  tokens: Record<string, TokenDefinition>;
}

export interface ResolvedColor {
  /**
   * Serialized string corresponding to `preferSpace`.
   * Always present.
   */
  value: CssColorString;
  /**
   * Auxiliary sRGB representation.
   * Only present if included via `includeSpaces`.
   */
  srgb?: CssColorString;
  /**
   * Auxiliary Display-P3 representation.
   * Only present if included via `includeSpaces`.
   */
  p3?: CssColorString;
  /**
   * Auxiliary OKLCH representation.
   * Only present if included via `includeSpaces`.
   */
  oklch?: CssColorString;
  alpha: number;
  meta?: ColorMeta;
}

export interface ColorQuery {
  role: ColorRole;
  variant?: SemanticVariant;
  usage?: ColorUsage;
  context?: ColorContext;
  surface?: SurfaceIntent;
  state?: ColorState;
  emphasis?: ColorEmphasis;
  on?: BackgroundHint;
  contrast?: ContrastRequirement;
  alpha?: AlphaStrategy;
  output?: OutputOptions;
}

export interface OnSolidQuery {
  bgRole: ColorRole;
  usage: "text" | "icon";
  context?: ColorContext;
  state?: ColorState;
  emphasis?: ColorEmphasis;
  alpha?: AlphaStrategy;
  contrast?: ContrastRequirement;
  output?: OutputOptions;
}

export interface SemanticColorTheme {
  resolve(query: ColorQuery): ResolvedColor;
  resolveMany(queries: ColorQuery[]): ResolvedColor[];
  color(role: ColorRole, options?: Omit<ColorQuery, "role">): ResolvedColor;
  onSolid(query: OnSolidQuery): ResolvedColor;
  withContext(context: ColorContext): SemanticColorTheme;
  export: {
    cssVars(): string;
    json(): unknown;
  };
}
