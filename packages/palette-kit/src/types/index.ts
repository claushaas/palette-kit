export type CssColorString = string;

export type ColorSpace = "srgb" | "p3" | "oklch" | "oklab";

export type ColorContext = "light" | "dark" | "highContrast" | "dimmed";

export type SurfaceIntent =
  | "app"
  | "surface"
  | "subtle"
  | "solid"
  | "overlay"
  | "data"
  | "transparent";

export type ColorState =
  | "default"
  | "hover"
  | "active"
  | "pressed"
  | "selected"
  | "focus"
  | "disabled"
  | "drag"
  | "loading";

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

export type ColorUsage =
  | "bg"
  | "border"
  | "text"
  | "icon"
  | "ring"
  | "shadow"
  | "stroke"
  | "fill";

export type BackgroundHint =
  | { kind: "auto" }
  | { kind: "role"; role: ColorRole }
  | { kind: "color"; value: CssColorString };

export type ContrastRequirement =
  | { model: "apca"; targetLc: number }
  | { model: "wcag2"; ratio: number }
  | { model: "none" };

export type AlphaStrategy =
  | { mode: "none" }
  | { mode: "fixed"; alpha: number }
  | { mode: "solveOnBackground" };

export type GamutMappingStrategy = "clip" | "compressChroma" | "preferP3ThenCompress";

export interface OutputOptions {
  preferSpace?: ColorSpace;
  includeSpaces?: ColorSpace[];
  gamutMapping?: GamutMappingStrategy;
  format?: string;
  strict?: boolean;
  precision?: {
    l?: number;
    c?: number;
    h?: number;
    alpha?: number;
  };
}

export interface RawColor {
  space: ColorSpace;
  channels: number[];
  alpha: number;
}

export interface ColorMeta {
  role?: ColorRole;
  surface?: SurfaceIntent;
  state?: ColorState;
  contrast?: ContrastRequirement;
  gamut?: ColorSpace;
  provenance?: string;
}

export interface ResolvedColor {
  value: CssColorString;
  srgb?: CssColorString;
  p3?: CssColorString;
  oklch?: CssColorString;
  oklab?: CssColorString;
  raw?: RawColor;
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

export type ColorQueryOptions = Omit<ColorQuery, "role">;

export interface SemanticColorTheme {
  resolve: (query: ColorQuery) => ResolvedColor;
  color: (role: ColorRole, options?: ColorQueryOptions) => ResolvedColor;
  onSolid: (query: OnSolidQuery) => ResolvedColor;
  resolveMany: (queries: ColorQuery[]) => ResolvedColor[];
  withContext: (context: ColorContext) => SemanticColorTheme;
  export: {
    cssVars: () => string;
    json: () => unknown;
  };
}
