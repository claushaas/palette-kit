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
  "disabled",
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

const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const rgbColorPattern =
  /^rgba?\(\s*[-+]?(\d+(\.\d+)?%?)(\s*,\s*[-+]?(\d+(\.\d+)?%?)){2}(\s*,\s*[-+]?(\d+(\.\d+)?%?)\s*)?\)$/i;
const oklchColorPattern =
  /^oklch\(\s*[-+]?(\d+(\.\d+)?%?)(\s+[-+]?(\d+(\.\d+)?%?)){1}(\s+[-+]?(\d+(\.\d+)?))(\s*\/\s*[-+]?(\d+(\.\d+)?%?))?\s*\)$/i;
const displayP3Pattern = /^color\(\s*display-p3\s+.+\)$/i;

const isCssColorString = (value: string) =>
  hexColorPattern.test(value) ||
  rgbColorPattern.test(value) ||
  oklchColorPattern.test(value) ||
  displayP3Pattern.test(value);

const inferUsageFromRole = (role: string): ColorUsage | undefined => {
  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole.startsWith("text.")) {
    return "text";
  }

  if (normalizedRole.startsWith("icon.")) {
    return "icon";
  }

  if (normalizedRole.startsWith("border.")) {
    return "border";
  }

  if (
    normalizedRole.startsWith("bg.") ||
    normalizedRole.startsWith("surface.") ||
    normalizedRole.startsWith("overlay.")
  ) {
    return "bg";
  }

  if (normalizedRole.startsWith("focus.") || normalizedRole.startsWith("ring.")) {
    return "ring";
  }

  if (normalizedRole.startsWith("chart.")) {
    const tokens = normalizedRole.split(".");

    if (tokens.includes("stroke")) {
      return "stroke";
    }

    if (tokens.includes("fill")) {
      return "fill";
    }

    if (tokens.includes("grid")) {
      return "border";
    }

    if (tokens.includes("label") || tokens.includes("text")) {
      return "text";
    }
  }

  return undefined;
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

    if (!isCssColorString(value)) {
      throw new Error(`Invalid background hint color value: "${hint.value}"`);
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

const validateIncludeSpaces = (includeSpaces: ColorSpace[] | undefined): ColorSpace[] => {
  const value = includeSpaces ?? [];

  value.forEach((space) => {
    assertOneOf(space, colorSpaces, "output includeSpaces");
  });

  return value;
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
  const includeSpaces = validateIncludeSpaces(output?.includeSpaces);

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

/**
 * Normalize a user-facing ColorQuery into a fully populated, validated structure.
 *
 * - Applies defaults for missing fields (context, surface, state, emphasis, output).
 * - Infers usage from role prefixes when not provided; in strict mode, missing usage errors.
 * - Validates nested objects (background hints, contrast requirements, alpha strategies).
 * - Trims string inputs and enforces allowed enum values.
 *
 * @example
 * normalizeQuery({ role: "text.primary" });
 * @example
 * normalizeQuery({
 *   role: "bg.canvas",
 *   on: { kind: "color", value: "#fff" },
 *   contrast: { model: "apca", targetLc: 60 },
 *   output: { strict: true },
 * });
 */
export function normalizeQuery(q: ColorQuery): NormalizedQuery {
  const role = normalizeRole(formatString(q.role));
  const contextValue = formatString(q.context) ?? "light";
  const surfaceValue = formatString(q.surface) ?? "surface";
  const stateValue = formatString(q.state) ?? "default";
  const emphasisValue = formatString(q.emphasis) ?? "default";
  const output = normalizeOutput(q.output);
  const usageValue = formatString(q.usage) ?? inferUsageFromRole(role);

  if (!usageValue) {
    if (output.strict) {
      throw new Error(`Usage is required for role: "${role}"`);
    }
  }

  return {
    role,
    usage: assertOneOf(usageValue ?? "bg", usages, "usage"),
    context: assertOneOf(contextValue, contexts, "context"),
    surface: assertOneOf(surfaceValue, surfaces, "surface"),
    state: assertOneOf(stateValue, states, "state"),
    emphasis: assertOneOf(emphasisValue, emphases, "emphasis"),
    variant: normalizeVariant(formatString(q.variant)),
    on: normalizeBackgroundHint(q.on),
    contrast: normalizeContrast(q.contrast),
    alpha: normalizeAlpha(q.alpha),
    output,
  };
}
