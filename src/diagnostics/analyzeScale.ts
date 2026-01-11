import type { Scale, ScaleDiagnostics } from "../types.js";

export function analyzeScale(scale: Scale): ScaleDiagnostics {
  const outOfGamutCount = scale.meta?.outOfGamutCount ?? 0;
  return { outOfGamutCount };
}
