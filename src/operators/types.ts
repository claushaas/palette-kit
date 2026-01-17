import type { OkLchColor } from "../engine/generateScale.js";
import type { CurvePresetName } from "../presets/index.js";
import type { ColorEmphasis, ColorState, ColorUsage, SurfaceIntent } from "../types/index.js";

export type OperatorInput = {
  oklch: OkLchColor;
  context: "light" | "dark";
  surface: SurfaceIntent;
  usage: ColorUsage;
  state: ColorState;
  emphasis: ColorEmphasis;
  preset?: CurvePresetName;
  step: number;
};
