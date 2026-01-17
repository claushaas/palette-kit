import type { CurvePresetName } from "../presets/index.js";
import { curvePresets } from "../presets/index.js";
import type { SurfaceIntent } from "../types/index.js";
import { clamp } from "../utils/clamp.js";
import { lerp } from "../utils/lerp.js";

// TODO: deduplicate with generateScale constants and helpers.
const STEPS = 12;
const OKLCH_L_MIN = 0;
const OKLCH_L_MAX = 100;

export type OperatorContext = "light" | "dark";

export const getSurfaceRange = (
  presetName: CurvePresetName | undefined,
  surface: SurfaceIntent,
  context: OperatorContext,
) => {
  const preset = curvePresets[presetName ?? "modern"];
  return preset.surfaces[surface].ranges[context];
};

export const getNeutralL = (
  presetName: CurvePresetName | undefined,
  surface: SurfaceIntent,
  context: OperatorContext,
) => {
  const range = getSurfaceRange(presetName, surface, context);
  return (range.l[0] + range.l[1]) / 2;
};

export const getStepLightness = (
  presetName: CurvePresetName | undefined,
  surface: SurfaceIntent,
  context: OperatorContext,
  step: number,
) => {
  const preset = curvePresets[presetName ?? "modern"];
  const surfaceCurve = preset.surfaces[surface];
  const range = surfaceCurve.ranges[context];
  const t = clamp((step - 1) / (STEPS - 1), 0, 1);
  const lightnessT = surfaceCurve.l(t);
  return clamp(lerp(range.l[0], range.l[1], lightnessT), OKLCH_L_MIN, OKLCH_L_MAX);
};
