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
  gamutMapping?: OutputOptions["gamutMapping"];
  provenance?: string;
}

export interface ResolvedColor {
  value: CssColorString;
  srgb?: CssColorString;
  p3?: CssColorString;
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
