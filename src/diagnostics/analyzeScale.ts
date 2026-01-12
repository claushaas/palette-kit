import type { Scale, ScaleDiagnostics } from "../types.js";

export function analyzeScale(scale: Scale): ScaleDiagnostics {
  return {
    outOfGamutCount: scale.meta?.outOfGamutCount ?? 0,
    outOfP3GamutCount: scale.meta?.outOfP3GamutCount ?? 0,
    anchorSteps: scale.meta?.anchorSteps,
  };
}
