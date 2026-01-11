import type { Step } from "../types.js";

export type CurveConfig = {
  lightness?: Partial<Record<Step, number>>;
  chroma?: Partial<Record<Step, number>>;
};

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const defaultLightness: Record<Step, number> = {
  1: 0.3,
  2: 0.3,
  3: 0.6,
  4: 0.6,
  5: 0.6,
  6: 0.85,
  7: 0.85,
  8: 0.85,
  9: 1,
  10: 1,
  11: 1,
  12: 1,
};

const defaultChroma: Record<Step, number> = {
  1: 0.2,
  2: 0.2,
  3: 0.6,
  4: 0.6,
  5: 0.6,
  6: 0.8,
  7: 0.8,
  8: 0.8,
  9: 1,
  10: 1,
  11: 0.7,
  12: 0.7,
};

export function resolveCurves(curves?: CurveConfig): {
  lightness: Record<Step, number>;
  chroma: Record<Step, number>;
} {
  const lightness = { ...defaultLightness };
  const chroma = { ...defaultChroma };

  if (curves?.lightness) {
    for (const step of steps) {
      if (curves.lightness[step] !== undefined) {
        lightness[step] = curves.lightness[step] as number;
      }
    }
  }

  if (curves?.chroma) {
    for (const step of steps) {
      if (curves.chroma[step] !== undefined) {
        chroma[step] = curves.chroma[step] as number;
      }
    }
  }

  return { lightness, chroma };
}
