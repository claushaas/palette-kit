import type {
  AlphaStrategy,
  BackgroundHint,
  ColorContext,
  ColorEmphasis,
  ColorQuery,
  ColorSpace,
  ColorState,
  ColorUsage,
  ContrastRequirement,
  OutputOptions,
  SemanticVariant,
  SurfaceIntent,
} from "../types/index.js";

export type NormalizedQuery = Required<
  Pick<
    ColorQuery,
    "role" | "usage" | "context" | "surface" | "state" | "emphasis"
  >
> & {
  variant?: ColorQuery["variant"];
  on?: ColorQuery["on"];
  contrast?: ColorQuery["contrast"];
  alpha?: ColorQuery["alpha"];
  output: Required<OutputOptions>;
};

const usages: ColorUsage[] = [
  "bg",
  "border",
  "text",
  "icon",
  "ring",
  "shadow",
  "stroke",
  "fill",
];

const contexts: ColorContext[] = ["light", "dark", "highContrast", "dimmed"];

const surfaces: SurfaceIntent[] = [
  "app",
  "surface",
  "subtle",
  "solid",
  "overlay",
  "data",
  "transparent",
];

const states: ColorState[] = [
  "default",
  "hover",
  "active",
  "selected",
  "focus",
  "pressed",
  "disabled",
  "drag",
  "loading",
];

const emphases: ColorEmphasis[] = [
  "muted",
  "subtle",
  "default",
  "strong",
  "inverted",
];

const semanticVariants: SemanticVariant[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
  "highlight",
  "premium",
];

const colorSpaces: ColorSpace[] = ["srgb", "p3", "oklch", "oklab"];

const gamutMappings: NonNullable<OutputOptions["gamutMapping"]>[] = [
  "clip",
  "compressChroma",
  "preferP3ThenCompress",
];

const formatString = (value: string | undefined) => (value ? value.trim() : undefined);

const assertOneOf = <T extends string>(
  value: string,
  options: readonly T[],
  label: string,
): T => {
  if (!options.includes(value as T)) {
    throw new Error(`Invalid ${label}: "${value}"`);
  }

  return value as T;
};

const normalizeRole = (role: string | undefined) => {
  if (role === undefined) {
    throw new Error("Color role is required");
  }

  const trimmed = role.trim();
  if (!trimmed) {
    throw new Error("Color role is required");
  }

  return trimmed;
};

const normalizeVariant = (variant: string | undefined): SemanticVariant | undefined => {
  if (!variant) {
    return undefined;
  }

  const trimmed = variant.trim();

  if (semanticVariants.includes(trimmed as SemanticVariant)) {
    return trimmed as SemanticVariant;
  }

  if (/^(category|chart):.+/.test(trimmed)) {
    return trimmed as SemanticVariant;
  }

  throw new Error(`Invalid variant: "${variant}"`);
};

const normalizeBackgroundHint = (
  hint: BackgroundHint | undefined,
): BackgroundHint | undefined => {
  if (!hint) {
    return undefined;
  }

  if (hint.kind === "auto") {
    return hint;
  }

  if (hint.kind === "role") {
    const trimmedRole = normalizeRole(hint.role);
    return { kind: "role", role: trimmedRole };
  }

  if (hint.kind === "color") {
    const value = hint.value.trim();
    if (!value) {
      throw new Error("Background hint color value is required");
    }

    return { kind: "color", value };
  }

  throw new Error(`Invalid background hint kind: "${(hint as BackgroundHint).kind}"`);
};

const normalizeContrast = (
  contrast: ContrastRequirement | undefined,
): ContrastRequirement | undefined => {
  if (!contrast) {
    return undefined;
  }

  if (contrast.model === "apca") {
    if (!Number.isFinite(contrast.targetLc)) {
      throw new Error("APCA targetLc must be a number");
    }

    return contrast;
  }

  if (contrast.model === "wcag2") {
    if (!Number.isFinite(contrast.ratio)) {
      throw new Error("WCAG2 ratio must be a number");
    }

    return contrast;
  }

  if (contrast.model === "none") {
    return contrast;
  }

  throw new Error(`Invalid contrast model: "${(contrast as ContrastRequirement).model}"`);
};

const normalizeAlpha = (alpha: AlphaStrategy | undefined): AlphaStrategy | undefined => {
  if (!alpha) {
    return undefined;
  }

  if (alpha.mode === "none") {
    return alpha;
  }

  if (alpha.mode === "fixed") {
    if (!Number.isFinite(alpha.alpha)) {
      throw new Error("Fixed alpha must be a number");
    }

    return alpha;
  }

  if (alpha.mode === "solveOnBackground") {
    return alpha;
  }

  throw new Error(`Invalid alpha strategy mode: "${(alpha as AlphaStrategy).mode}"`);
};

const normalizeOutput = (output: OutputOptions | undefined): Required<OutputOptions> => {
  const preferSpaceValue = formatString(output?.preferSpace);
  const gamutMappingValue = formatString(output?.gamutMapping);
  const includeSpaces = output?.includeSpaces ?? [];

  includeSpaces.forEach((space) => {
    assertOneOf(space, colorSpaces, "output includeSpaces");
  });

  const preferSpace = preferSpaceValue
    ? assertOneOf(preferSpaceValue, colorSpaces, "output preferSpace")
    : "oklch";

  const gamutMapping = gamutMappingValue
    ? assertOneOf(gamutMappingValue, gamutMappings, "output gamutMapping")
    : "preferP3ThenCompress";

  if (output?.strict !== undefined && typeof output.strict !== "boolean") {
    throw new Error("Output strict must be a boolean");
  }

  if (output?.includeMeta !== undefined && typeof output.includeMeta !== "boolean") {
    throw new Error("Output includeMeta must be a boolean");
  }

  return {
    preferSpace,
    includeSpaces,
    gamutMapping,
    format: output?.format ?? "css",
    strict: output?.strict ?? false,
    precision: {
      l: 1,
      c: 3,
      h: 1,
      ...output?.precision,
    },
    includeMeta: output?.includeMeta ?? false,
  };
};

export function normalizeQuery(q: ColorQuery): NormalizedQuery {
  const role = normalizeRole(formatString(q.role));
  const usageValue = formatString(q.usage) ?? "bg";
  const contextValue = formatString(q.context) ?? "light";
  const surfaceValue = formatString(q.surface) ?? "surface";
  const stateValue = formatString(q.state) ?? "default";
  const emphasisValue = formatString(q.emphasis) ?? "default";

  return {
    role,
    usage: assertOneOf(usageValue, usages, "usage"),
    context: assertOneOf(contextValue, contexts, "context"),
    surface: assertOneOf(surfaceValue, surfaces, "surface"),
    state: assertOneOf(stateValue, states, "state"),
    emphasis: assertOneOf(emphasisValue, emphases, "emphasis"),
    variant: normalizeVariant(formatString(q.variant)),
    on: normalizeBackgroundHint(q.on),
    contrast: normalizeContrast(q.contrast),
    alpha: normalizeAlpha(q.alpha),
    output: normalizeOutput(q.output),
  };
}
