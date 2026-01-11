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
import type { ColorHex, ColorP3, ColorSource, Scale, Step, TemplateId } from "./types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type GenerateScaleOptions = {
  source: ColorSource;
  mode?: "light" | "dark" | "both";
  anchorStep?: Step;
  template?: "auto" | TemplateId;
  curves?: CurveConfig;
  gamut?: { strategy: "compress" | "clip" };
  p3?: boolean;
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

function buildScaleForMode(
  seedHex: ColorHex,
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
  const seedOklch = hexToOklch(seedHex);
  const template = templates[mode][templateId];
  const anchor = template[anchorStep];
  const dL = seedOklch.l - anchor.l;
  const dC = seedOklch.c - anchor.c;
  const dH = seedOklch.h - anchor.h;
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
  const anchorStep = options.anchorStep ?? 9;
  const mode = options.mode ?? "both";
  const templateId =
    options.template === "auto" || !options.template
      ? selectTemplateId(hexToOklch(seedHex))
      : options.template;
  const gamutStrategy = options.gamut?.strategy ?? "compress";

  const lightResult = buildScaleForMode(
    seedHex,
    templateId,
    anchorStep,
    options.curves,
    gamutStrategy,
    "light",
    options.p3 ?? false,
  );

  const darkResult = buildScaleForMode(
    seedHex,
    templateId,
    anchorStep,
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
    },
  };

  if (mode === "light") {
    return {
      ...scale,
      dark: scale.light,
      p3: scale.p3 ? { light: scale.p3.light, dark: scale.p3.light } : undefined,
    };
  }
  if (mode === "dark") {
    return {
      ...scale,
      light: scale.dark,
      p3: scale.p3 ? { light: scale.p3.dark, dark: scale.p3.dark } : undefined,
    };
  }

  return scale;
}
