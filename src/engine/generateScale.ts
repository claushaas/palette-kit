import type { SurfaceIntent } from "../types/index.js";
import type { CurveParams, CurvePresetName } from "../presets/curves.js";
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

const computeChroma = (lightness: number, seedChroma: number, params: CurveParams): number => {
  const range = params.lEnd - params.lStart;
  const t = range === 0 ? 0 : (lightness - params.lStart) / range;
  const normalizedT = clamp(t, 0, 1);
  const ridge = 1 - Math.abs(2 * normalizedT - 1);
  const shaped = Math.pow(clamp(ridge, 0, 1), params.cPower);
  const baseChroma = lerp(params.cMin, params.cMax, shaped);
  const cappedChroma = Math.min(baseChroma, Math.max(0, seedChroma));

  // TODO(Fase 8): gamut mapping
  return clamp(cappedChroma, 0, params.cMax);
};

export function generateScale(seed: OkLchColor, options: GenerateScaleOptions): OkLchColor[] {
  const presetName = options.preset ?? "modern";
  const preset = curvePresets[presetName];
  const surfaceCurve = preset.surfaces[options.surface];
  const curve = surfaceCurve[options.context];

  return Array.from({ length: STEPS }, (_, index) => {
    const t = STEPS === 1 ? 0 : index / (STEPS - 1);
    const l = clamp(lerp(curve.lStart, curve.lEnd, t), OKLCH_L_MIN, OKLCH_L_MAX);
    const c = computeChroma(l, seed.c ?? 0, curve);

    return {
      l,
      c,
      h: seed.h,
      alpha: seed.alpha,
    };
  });
}
