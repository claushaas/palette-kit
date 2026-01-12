import { apcaContrast } from "./contrast/apca.js";
import { onSolidTextTokens } from "./contrast/onSolid.js";
import { radixSeeds } from "./data/radixSeeds.js";
import { type CurveConfig, resolveCurves } from "./engine/curves.js";
import {
  compressToP3,
  compressToSrgb,
  hexToOklch,
  inP3Gamut,
  inSrgbGamut,
  oklchToHex,
  oklchToP3,
} from "./engine/oklch.js";
import { selectTemplateId, templates } from "./engine/templates.js";
import type {
  ColorHex,
  ColorP3,
  ColorSource,
  OklchColor,
  Scale,
  Step,
  TemplateId,
} from "./types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type AnchorStepOption =
  | Step
  | "auto"
  | {
      light?: Step | "auto";
      dark?: Step | "auto";
    };

export type AutoAnchorModeOptions = {
  candidateSteps?: Step[];
  backgroundStep?: Step;
  backgroundSteps?: Step[];
  solidStep?: Step;
  textStep?: Step;
  targetContrast?: number;
  minBackgroundL?: number;
  maxBackgroundL?: number;
  minTextL?: number;
  maxTextL?: number;
};

export type AutoAnchorOptions = {
  candidateSteps?: Step[];
  light?: AutoAnchorModeOptions;
  dark?: AutoAnchorModeOptions;
};

export type SeedNormalizeRange = {
  minL?: number;
  maxL?: number;
  minC?: number;
  maxC?: number;
};

export type SeedNormalizeOptions = {
  enabled?: boolean;
  light?: SeedNormalizeRange;
  dark?: SeedNormalizeRange;
};

export type GenerateScaleOptions = {
  source: ColorSource;
  mode?: "light" | "dark" | "both";
  anchorStep?: AnchorStepOption;
  autoAnchor?: AutoAnchorOptions;
  seedNormalize?: SeedNormalizeOptions;
  template?: "auto" | TemplateId;
  curves?: CurveConfig;
  gamut?: { strategy: "compress" | "clip" };
  p3?: boolean;
};

type ResolvedAutoAnchorModeOptions = {
  candidateSteps: Step[];
  backgroundStep: Step;
  backgroundSteps: Step[];
  solidStep: Step;
  textStep: Step;
  targetContrast: number;
  minBackgroundL: number;
  maxBackgroundL: number;
  minTextL: number;
  maxTextL: number;
};

type ResolvedAutoAnchorOptions = {
  light: ResolvedAutoAnchorModeOptions;
  dark: ResolvedAutoAnchorModeOptions;
};

type ResolvedSeedNormalizeOptions = {
  enabled: boolean;
  light: SeedNormalizeRange;
  dark: SeedNormalizeRange;
};

type AutoAnchorModeDefaults = Omit<ResolvedAutoAnchorModeOptions, "candidateSteps">;

const defaultAutoAnchor: {
  candidateSteps: Step[];
  light: AutoAnchorModeDefaults;
  dark: AutoAnchorModeDefaults;
} = {
  candidateSteps: [8, 9, 10],
  light: {
    backgroundStep: 1 as Step,
    backgroundSteps: [1 as Step, 2 as Step, 3 as Step],
    solidStep: 9 as Step,
    textStep: 12 as Step,
    targetContrast: 90,
    minBackgroundL: 0.86,
    maxBackgroundL: 0.98,
    minTextL: 0.22,
    maxTextL: 0.55,
  },
  dark: {
    backgroundStep: 1 as Step,
    backgroundSteps: [1 as Step, 2 as Step, 3 as Step],
    solidStep: 9 as Step,
    textStep: 12 as Step,
    targetContrast: 75,
    minBackgroundL: 0.1,
    maxBackgroundL: 0.32,
    minTextL: 0.75,
    maxTextL: 0.98,
  },
};

const defaultSeedNormalize = {
  light: {
    minL: 0.35,
    maxL: 0.9,
  },
  dark: {
    minL: 0.32,
    maxL: 0.82,
  },
};

function getSeedHex(source: ColorSource): ColorHex {
  if (source.source === "seed") {
    return source.value;
  }

  const seed = radixSeeds[source.name];
  if (!seed) {
    throw new Error(`Unknown Radix seed: ${source.name}`);
  }
  return seed;
}

function normalizeHue(hue: number): number {
  const normalized = ((hue % 360) + 360) % 360;
  return normalized;
}

function clampValue(value: number, min?: number, max?: number): number {
  let current = value;
  if (min !== undefined) {
    current = Math.max(min, current);
  }
  if (max !== undefined) {
    current = Math.min(max, current);
  }
  return current;
}

function normalizeSeed(seed: OklchColor, range: SeedNormalizeRange): OklchColor {
  const l = clampValue(seed.l, range.minL, range.maxL);
  const c = clampValue(seed.c, range.minC, range.maxC);

  return {
    l,
    c: Math.max(0, c),
    h: seed.h,
  };
}

function resolveAnchorOption(
  option: AnchorStepOption | undefined,
  mode: "light" | "dark",
): Step | "auto" | undefined {
  if (!option) {
    return undefined;
  }
  if (typeof option === "object") {
    return option[mode];
  }
  return option;
}

function resolveSeedNormalizeOptions(
  options: SeedNormalizeOptions | undefined,
  autoEnabled: boolean,
): ResolvedSeedNormalizeOptions {
  const enabled = options?.enabled ?? autoEnabled;
  return {
    enabled,
    light: { ...defaultSeedNormalize.light, ...options?.light },
    dark: { ...defaultSeedNormalize.dark, ...options?.dark },
  };
}

function resolveCandidateSteps(candidateSteps?: Step[]): Step[] {
  const unique = Array.from(new Set(candidateSteps ?? defaultAutoAnchor.candidateSteps));
  return unique.length > 0 ? unique : [9];
}

function resolveAutoAnchorModeOptions(
  base: AutoAnchorModeDefaults,
  overrides: AutoAnchorModeOptions | undefined,
  candidateSteps: Step[],
): ResolvedAutoAnchorModeOptions {
  const resolvedCandidates = resolveCandidateSteps(overrides?.candidateSteps ?? candidateSteps);
  const resolvedBackgroundStep = overrides?.backgroundStep ?? base.backgroundStep;
  const resolvedBackgroundSteps = overrides?.backgroundSteps ?? base.backgroundSteps;
  return {
    candidateSteps: resolvedCandidates,
    backgroundStep: resolvedBackgroundStep,
    backgroundSteps:
      resolvedBackgroundSteps.length > 0 ? resolvedBackgroundSteps : [resolvedBackgroundStep],
    solidStep: overrides?.solidStep ?? base.solidStep,
    textStep: overrides?.textStep ?? base.textStep,
    targetContrast: overrides?.targetContrast ?? base.targetContrast,
    minBackgroundL: overrides?.minBackgroundL ?? base.minBackgroundL,
    maxBackgroundL: overrides?.maxBackgroundL ?? base.maxBackgroundL,
    minTextL: overrides?.minTextL ?? base.minTextL,
    maxTextL: overrides?.maxTextL ?? base.maxTextL,
  };
}

function resolveAutoAnchorOptions(options?: AutoAnchorOptions): ResolvedAutoAnchorOptions {
  const candidateSteps = resolveCandidateSteps(options?.candidateSteps);
  return {
    light: resolveAutoAnchorModeOptions(defaultAutoAnchor.light, options?.light, candidateSteps),
    dark: resolveAutoAnchorModeOptions(defaultAutoAnchor.dark, options?.dark, candidateSteps),
  };
}

function rangePenalty(value: number, min: number, max: number, weight = 100): number {
  if (value < min) {
    return (min - value) * weight;
  }
  if (value > max) {
    return (value - max) * weight;
  }
  return 0;
}

function scoreScale(scale: Record<Step, ColorHex>, options: ResolvedAutoAnchorModeOptions): number {
  const solid = scale[options.solidStep];
  const onSolid = onSolidTextTokens(solid);
  const contrast = Math.abs(apcaContrast(onSolid.primary, solid));
  const text = scale[options.textStep];
  const textL = hexToOklch(text).l;
  const backgroundLs = options.backgroundSteps.map((step) => hexToOklch(scale[step]).l);
  const minBackgroundL = Math.min(...backgroundLs);
  const maxBackgroundL = Math.max(...backgroundLs);

  let score = 0;
  const contrastDelta = options.targetContrast - contrast;
  if (contrastDelta > 0) {
    score += contrastDelta * 2.2;
  }
  score += rangePenalty(minBackgroundL, options.minBackgroundL, options.maxBackgroundL, 180);
  score += rangePenalty(maxBackgroundL, options.minBackgroundL, options.maxBackgroundL, 180);
  score += rangePenalty(textL, options.minTextL, options.maxTextL, 120);

  return score;
}

function pickAutoAnchorStep(
  seed: OklchColor,
  templateId: TemplateId,
  curves: CurveConfig | undefined,
  gamutStrategy: "compress" | "clip",
  mode: "light" | "dark",
  options: ResolvedAutoAnchorModeOptions,
): Step {
  let bestStep: Step = 9;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of options.candidateSteps) {
    const result = buildScaleForMode(
      seed,
      templateId,
      candidate,
      curves,
      gamutStrategy,
      mode,
      false,
    );
    const score = scoreScale(result.scale, options) + Math.abs(candidate - 9) * 2;

    if (score < bestScore) {
      bestScore = score;
      bestStep = candidate;
    } else if (score === bestScore) {
      if (Math.abs(candidate - 9) < Math.abs(bestStep - 9)) {
        bestStep = candidate;
      }
    }
  }

  return bestStep;
}

function buildScaleForMode(
  seed: OklchColor,
  templateId: TemplateId,
  anchorStep: Step,
  curves?: CurveConfig,
  gamutStrategy: "compress" | "clip" = "compress",
  mode: "light" | "dark" = "light",
  includeP3 = false,
): {
  scale: Record<Step, ColorHex>;
  p3?: Record<Step, ColorP3>;
  outOfGamutCount: number;
  outOfP3GamutCount: number;
} {
  const template = templates[mode][templateId];
  const anchor = template[anchorStep];
  const dL = seed.l - anchor.l;
  const dC = seed.c - anchor.c;
  const dH = seed.h - anchor.h;
  const curveSet = resolveCurves(curves);

  const output = {} as Record<Step, ColorHex>;
  const p3Output = includeP3 ? ({} as Record<Step, ColorP3>) : undefined;
  let outOfGamutCount = 0;
  let outOfP3GamutCount = 0;

  for (const step of steps) {
    const base = template[step];
    const l = base.l + dL * curveSet.lightness[step];
    const c = Math.max(0, base.c + dC * curveSet.chroma[step]);
    const h = normalizeHue(base.h + dH);
    const candidate = { l, c, h };
    let current = candidate;

    if (!inSrgbGamut(current)) {
      outOfGamutCount += 1;
      if (gamutStrategy === "compress") {
        current = compressToSrgb(current);
      }
    }

    output[step] = oklchToHex(current);

    if (p3Output) {
      let p3Current = candidate;
      if (!inP3Gamut(p3Current)) {
        outOfP3GamutCount += 1;
        p3Current = compressToP3(p3Current);
      }
      p3Output[step] = oklchToP3(p3Current);
    }
  }

  return {
    scale: output,
    p3: p3Output,
    outOfGamutCount,
    outOfP3GamutCount,
  };
}

export function generateScale(options: GenerateScaleOptions): Scale {
  const seedHex = getSeedHex(options.source);
  const seedOklch = hexToOklch(seedHex);
  const mode = options.mode ?? "both";
  const templateId =
    options.template === "auto" || !options.template
      ? selectTemplateId(seedOklch)
      : options.template;
  const gamutStrategy = options.gamut?.strategy ?? "compress";
  const anchorOption = options.anchorStep ?? "auto";
  const anchorLightOption = resolveAnchorOption(anchorOption, "light");
  const anchorDarkOption = resolveAnchorOption(anchorOption, "dark");
  const autoAnchorOptions = resolveAutoAnchorOptions(options.autoAnchor);
  const autoEnabled = anchorLightOption === "auto" || anchorDarkOption === "auto";
  const seedNormalize = resolveSeedNormalizeOptions(options.seedNormalize, autoEnabled);

  const lightSeed = seedNormalize.enabled
    ? normalizeSeed(seedOklch, seedNormalize.light)
    : seedOklch;
  const darkSeed = seedNormalize.enabled ? normalizeSeed(seedOklch, seedNormalize.dark) : seedOklch;

  const lightAnchorStep =
    anchorLightOption === "auto"
      ? pickAutoAnchorStep(
          lightSeed,
          templateId,
          options.curves,
          gamutStrategy,
          "light",
          autoAnchorOptions.light,
        )
      : (anchorLightOption ?? 9);

  const darkAnchorStep =
    anchorDarkOption === "auto"
      ? pickAutoAnchorStep(
          darkSeed,
          templateId,
          options.curves,
          gamutStrategy,
          "dark",
          autoAnchorOptions.dark,
        )
      : (anchorDarkOption ?? 9);

  const lightResult = buildScaleForMode(
    lightSeed,
    templateId,
    lightAnchorStep,
    options.curves,
    gamutStrategy,
    "light",
    options.p3 ?? false,
  );

  const darkResult = buildScaleForMode(
    darkSeed,
    templateId,
    darkAnchorStep,
    options.curves,
    gamutStrategy,
    "dark",
    options.p3 ?? false,
  );

  const scale: Scale = {
    light: lightResult.scale,
    dark: darkResult.scale,
    p3:
      lightResult.p3 && darkResult.p3 ? { light: lightResult.p3, dark: darkResult.p3 } : undefined,
    meta: {
      outOfGamutCount: lightResult.outOfGamutCount + darkResult.outOfGamutCount,
      outOfP3GamutCount: lightResult.outOfP3GamutCount + darkResult.outOfP3GamutCount,
      anchorSteps: {
        light: lightAnchorStep,
        dark: darkAnchorStep,
      },
    },
  };

  if (mode === "light") {
    return {
      ...scale,
      dark: scale.light,
      p3: scale.p3 ? { light: scale.p3.light, dark: scale.p3.light } : undefined,
      meta: scale.meta
        ? {
            ...scale.meta,
            anchorSteps: { light: lightAnchorStep, dark: lightAnchorStep },
          }
        : undefined,
    };
  }
  if (mode === "dark") {
    return {
      ...scale,
      light: scale.dark,
      p3: scale.p3 ? { light: scale.p3.dark, dark: scale.p3.dark } : undefined,
      meta: scale.meta
        ? {
            ...scale.meta,
            anchorSteps: { light: darkAnchorStep, dark: darkAnchorStep },
          }
        : undefined,
    };
  }

  return scale;
}
