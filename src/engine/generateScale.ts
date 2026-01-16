import type { SurfaceIntent } from "../types/index.js";
import type { CurvePresetName } from "../presets/curves.js";
import { curvePresets } from "../presets/curves.js";
import { clamp } from "../utils/clamp.js";
import { lerp } from "../utils/lerp.js";

export type OkLchColor = {
  l: number;
  c: number;
  h: number;
  alpha?: number;
};

type GenerateScaleOptions = {
  context: "light" | "dark";
  surface: SurfaceIntent;
  preset?: CurvePresetName;
};

const STEPS = 12;
const OKLCH_L_MIN = 0;
const OKLCH_L_MAX = 100;

export function generateScale(seed: OkLchColor, options: GenerateScaleOptions): OkLchColor[] {
  const presetName = options.preset ?? "modern";
  const preset = curvePresets[presetName];
  const surfaceCurve = preset.surfaces[options.surface];
  const range = surfaceCurve.ranges[options.context];

  return Array.from({ length: STEPS }, (_, index) => {
    const t = index / (STEPS - 1);
    const lightnessT = surfaceCurve.l(t);
    const chromaT = surfaceCurve.c(lightnessT);
    const l = clamp(lerp(range.l[0], range.l[1], lightnessT), OKLCH_L_MIN, OKLCH_L_MAX);
    // Allow select surfaces to exceed seed chroma slightly while staying within range caps.
    const chromaBoost = range.chromaBoost ?? 1;
    const boostedSeed = (seed.c ?? range.cMax) * chromaBoost;
    const maxChroma = Math.min(range.cMax, Math.max(0, boostedSeed));
    const c = clamp(lerp(range.cMin, maxChroma, chromaT), 0, range.cMax);

    return {
      l,
      c,
      h: seed.h,
      alpha: seed.alpha,
    };
  });
}
