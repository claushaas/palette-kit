import { radixSeeds } from "./data/radixSeeds.js";
import { type CurveConfig, resolveCurves } from "./engine/curves.js";
import { compressToSrgb, hexToOklch, inSrgbGamut, oklchToHex } from "./engine/oklch.js";
import { selectTemplateId, templates } from "./engine/templates.js";
import type { ColorHex, ColorSource, Scale, Step, TemplateId } from "./types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type GenerateScaleOptions = {
  source: ColorSource;
  mode?: "light" | "dark" | "both";
  anchorStep?: Step;
  template?: "auto" | TemplateId;
  curves?: CurveConfig;
  gamut?: { strategy: "compress" | "clip" };
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
): { scale: Record<Step, ColorHex>; outOfGamutCount: number } {
  const seedOklch = hexToOklch(seedHex);
  const template = templates[mode][templateId];
  const anchor = template[anchorStep];
  const dL = seedOklch.l - anchor.l;
  const dC = seedOklch.c - anchor.c;
  const dH = seedOklch.h - anchor.h;
  const curveSet = resolveCurves(curves);

  const output = {} as Record<Step, ColorHex>;
  let outOfGamutCount = 0;

  for (const step of steps) {
    const base = template[step];
    const l = base.l + dL * curveSet.lightness[step];
    const c = Math.max(0, base.c + dC * curveSet.chroma[step]);
    const h = normalizeHue(base.h + dH);
    let current = { l, c, h };

    if (!inSrgbGamut(current)) {
      outOfGamutCount += 1;
      if (gamutStrategy === "compress") {
        current = compressToSrgb(current);
      }
    }

    output[step] = oklchToHex(current);
  }

  return { scale: output, outOfGamutCount };
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
  );

  const darkResult = buildScaleForMode(
    seedHex,
    templateId,
    anchorStep,
    options.curves,
    gamutStrategy,
    "dark",
  );

  const scale: Scale = {
    light: lightResult.scale,
    dark: darkResult.scale,
    meta: {
      outOfGamutCount: lightResult.outOfGamutCount + darkResult.outOfGamutCount,
    },
  };

  if (mode === "light") {
    return { ...scale, dark: scale.light };
  }
  if (mode === "dark") {
    return { ...scale, light: scale.dark };
  }

  return scale;
}
