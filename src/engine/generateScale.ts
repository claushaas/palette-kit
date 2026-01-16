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
    const t = STEPS === 1 ? 0 : index / (STEPS - 1);
    const lightnessT = surfaceCurve.l(t);
    const chromaT = surfaceCurve.c(lightnessT);
    const l = clamp(lerp(range.l[0], range.l[1], lightnessT), OKLCH_L_MIN, OKLCH_L_MAX);
    const maxChroma = Math.min(range.cMax, Math.max(0, seed.c ?? range.cMax));
    const c = clamp(lerp(range.cMin, maxChroma, chromaT), 0, range.cMax);

    return {
      l,
      c,
      h: seed.h,
      alpha: seed.alpha,
    };
  });
}
