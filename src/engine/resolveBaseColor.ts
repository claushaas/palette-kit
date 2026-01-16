import type { CurvePresetName } from "../presets/index.js";
import type {
  ColorUsage,
  CssColorString,
  SemanticVariant,
  SurfaceIntent,
} from "../types/index.js";
import type { NormalizedQuery } from "./normalize.js";
import { mapColorContextToEngine } from "./context.js";
import { parseColor } from "../utils/parseColor.js";
import { generateScale, type OkLchColor } from "./generateScale.js";

type ThemeSeeds = {
  neutral: CssColorString;
  accent: CssColorString;
};

export type ThemeConfig = {
  seeds: {
    light: ThemeSeeds;
    dark: ThemeSeeds;
  };
  variants?: Record<string, CssColorString>;
  preset?: CurvePresetName;
};

type VariantResolution = {
  variantUsed: string;
  seedUsed: CssColorString;
};

const isCategoryVariant = (variant: string) => variant.startsWith("category:");
const isChartVariant = (variant: string) => variant.startsWith("chart:");

const aliasVariants = new Set<SemanticVariant>(["success", "warning", "danger", "info"]);

const inferVariantFromRole = (role: string): "neutral" | "accent" => {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.startsWith("action.")) {
    return "accent";
  }

  if (
    normalizedRole.startsWith("bg.") ||
    normalizedRole.startsWith("surface.") ||
    normalizedRole.startsWith("border.") ||
    normalizedRole.startsWith("text.")
  ) {
    return "neutral";
  }

  return "neutral";
};

const resolveVariantSeed = (
  variant: SemanticVariant | undefined,
  role: string,
  config: ThemeConfig,
  contextKey: "light" | "dark",
): VariantResolution => {
  if (variant) {
    if (variant === "neutral" || variant === "accent") {
      return {
        variantUsed: variant,
        seedUsed: config.seeds[contextKey][variant],
      };
    }

    if (isCategoryVariant(variant) || isChartVariant(variant)) {
      const customSeed = config.variants?.[variant];
      if (customSeed) {
        return { variantUsed: variant, seedUsed: customSeed };
      }

      return { variantUsed: "accent", seedUsed: config.seeds[contextKey].accent };
    }

    if (aliasVariants.has(variant)) {
      return { variantUsed: "accent", seedUsed: config.seeds[contextKey].accent };
    }

    return { variantUsed: "accent", seedUsed: config.seeds[contextKey].accent };
  }

  const inferredVariant = inferVariantFromRole(role);

  return {
    variantUsed: inferredVariant,
    seedUsed: config.seeds[contextKey][inferredVariant],
  };
};

const clampStep = (value: number) => Math.min(12, Math.max(1, value));

const resolveStep = (usage: ColorUsage, surface: SurfaceIntent): number => {
  switch (usage) {
    case "bg": {
      switch (surface) {
        case "app":
          return 1;
        case "surface":
          return 2;
        case "subtle":
          return 3;
        case "solid":
          return 9;
        case "overlay":
          return 2;
        case "data":
          return 9;
        case "transparent":
          return 1;
        default:
          return 2;
      }
    }
    case "border": {
      switch (surface) {
        case "solid":
        case "data":
          return 8;
        default:
          return 6;
      }
    }
    case "text":
      return 11;
    case "icon":
      return 11;
    case "ring":
      return 8;
    case "stroke":
      return surface === "data" ? 9 : 8;
    case "fill":
      return 9;
    default:
      return 6;
  }
};

export type BaseResolvedColor = {
  oklch: OkLchColor;
  step: number;
  variantUsed: string;
  seedUsed: CssColorString;
};

export function resolveBaseColor(
  normalized: NormalizedQuery,
  theme: ThemeConfig,
): BaseResolvedColor {
  const contextKey = mapColorContextToEngine(normalized.context);
  const { variantUsed, seedUsed } = resolveVariantSeed(
    normalized.variant,
    normalized.role,
    theme,
    contextKey,
  );

  const parsedSeed = parseColor(seedUsed);
  const seed: OkLchColor = {
    l: parsedSeed.okLch.channels[0] * 100,
    c: parsedSeed.okLch.channels[1],
    h: parsedSeed.okLch.channels[2],
    alpha: parsedSeed.okLch.alpha,
  };

  const scale = generateScale(seed, {
    context: contextKey,
    surface: normalized.surface,
    preset: theme.preset,
  });
  const step = clampStep(resolveStep(normalized.usage, normalized.surface));
  const oklch = scale[step - 1];

  return {
    oklch,
    step,
    variantUsed,
    seedUsed,
  };
}
