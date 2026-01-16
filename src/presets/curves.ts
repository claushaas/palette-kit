import type { SurfaceIntent } from "../types/index.js";

export type CurvePresetName = "modern" | "radixLike";

export type CurveParams = {
  lStart: number;
  lEnd: number;
  cMin: number;
  cMax: number;
  cPower: number;
};

export type SurfaceCurves = Record<
  SurfaceIntent,
  {
    light: CurveParams;
    dark: CurveParams;
  }
>;

export type CurvePreset = {
  name: CurvePresetName;
  surfaces: SurfaceCurves;
};

export const modern: CurvePreset = {
  name: "modern",
  surfaces: {
    app: {
      light: { lStart: 88, lEnd: 99, cMin: 0.01, cMax: 0.06, cPower: 1.8 },
      dark: { lStart: 6, lEnd: 22, cMin: 0.01, cMax: 0.08, cPower: 1.8 },
    },
    surface: {
      light: { lStart: 82, lEnd: 97, cMin: 0.015, cMax: 0.09, cPower: 1.7 },
      dark: { lStart: 8, lEnd: 28, cMin: 0.015, cMax: 0.1, cPower: 1.7 },
    },
    subtle: {
      light: { lStart: 76, lEnd: 95, cMin: 0.02, cMax: 0.11, cPower: 1.6 },
      dark: { lStart: 10, lEnd: 32, cMin: 0.02, cMax: 0.12, cPower: 1.6 },
    },
    solid: {
      light: { lStart: 45, lEnd: 90, cMin: 0.05, cMax: 0.18, cPower: 1.4 },
      dark: { lStart: 12, lEnd: 40, cMin: 0.05, cMax: 0.2, cPower: 1.4 },
    },
    overlay: {
      light: { lStart: 70, lEnd: 96, cMin: 0.02, cMax: 0.12, cPower: 1.6 },
      dark: { lStart: 14, lEnd: 42, cMin: 0.02, cMax: 0.14, cPower: 1.6 },
    },
    data: {
      light: { lStart: 40, lEnd: 85, cMin: 0.06, cMax: 0.22, cPower: 1.3 },
      dark: { lStart: 18, lEnd: 48, cMin: 0.06, cMax: 0.24, cPower: 1.3 },
    },
    transparent: {
      light: { lStart: 60, lEnd: 96, cMin: 0, cMax: 0.08, cPower: 1.9 },
      dark: { lStart: 8, lEnd: 30, cMin: 0, cMax: 0.1, cPower: 1.9 },
    },
  },
};

export const radixLike: CurvePreset = {
  name: "radixLike",
  surfaces: {
    app: {
      light: { lStart: 90, lEnd: 99, cMin: 0.008, cMax: 0.07, cPower: 1.4 },
      dark: { lStart: 4, lEnd: 18, cMin: 0.008, cMax: 0.09, cPower: 1.4 },
    },
    surface: {
      light: { lStart: 84, lEnd: 97, cMin: 0.012, cMax: 0.1, cPower: 1.35 },
      dark: { lStart: 6, lEnd: 24, cMin: 0.012, cMax: 0.12, cPower: 1.35 },
    },
    subtle: {
      light: { lStart: 78, lEnd: 94, cMin: 0.018, cMax: 0.13, cPower: 1.3 },
      dark: { lStart: 8, lEnd: 30, cMin: 0.018, cMax: 0.14, cPower: 1.3 },
    },
    solid: {
      light: { lStart: 48, lEnd: 88, cMin: 0.05, cMax: 0.2, cPower: 1.2 },
      dark: { lStart: 10, lEnd: 36, cMin: 0.05, cMax: 0.22, cPower: 1.2 },
    },
    overlay: {
      light: { lStart: 72, lEnd: 96, cMin: 0.02, cMax: 0.14, cPower: 1.3 },
      dark: { lStart: 12, lEnd: 38, cMin: 0.02, cMax: 0.16, cPower: 1.3 },
    },
    data: {
      light: { lStart: 38, lEnd: 84, cMin: 0.07, cMax: 0.24, cPower: 1.15 },
      dark: { lStart: 16, lEnd: 44, cMin: 0.07, cMax: 0.26, cPower: 1.15 },
    },
    transparent: {
      light: { lStart: 58, lEnd: 94, cMin: 0, cMax: 0.1, cPower: 1.5 },
      dark: { lStart: 6, lEnd: 28, cMin: 0, cMax: 0.12, cPower: 1.5 },
    },
  },
};

export const curvePresets: Record<CurvePresetName, CurvePreset> = {
  modern,
  radixLike,
};
