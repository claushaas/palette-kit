import type { SurfaceIntent } from "../types/index.js";
import { clamp } from "../utils/clamp.js";
import { smoothstep } from "../utils/smoothstep.js";

export type CurvePresetName = "modern" | "radixLike";

export type CurveFn = (t: number) => number;

export type SurfaceCurve = {
  l: CurveFn;
  c: CurveFn;
  ranges: {
    light: { l: [number, number]; cMin: number; cMax: number; chromaBoost?: number };
    dark: { l: [number, number]; cMin: number; cMax: number; chromaBoost?: number };
  };
};

export type CurvePreset = {
  name: CurvePresetName;
  surfaces: Record<SurfaceIntent, SurfaceCurve>;
};

const normalizeT = (t: number) => clamp(t, 0, 1);
const lightnessCurve: CurveFn = (t) => smoothstep(normalizeT(t));
const chromaCurve: CurveFn = (t) => Math.sin(Math.PI * normalizeT(t));

export const modern: CurvePreset = {
  name: "modern",
  surfaces: {
    // app: fundo do app (separação mínima, chroma baixíssimo)
    app: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [90, 99], cMin: 0.004, cMax: 0.05 },
        dark: { l: [6, 22], cMin: 0.004, cMax: 0.07 },
      },
    },
    // surface: cards/panels (separação leve do app bg, chroma baixo)
    surface: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [84, 97], cMin: 0.008, cMax: 0.08 },
        dark: { l: [8, 28], cMin: 0.008, cMax: 0.09 },
      },
    },
    // subtle: tints/hover backgrounds (um pouco mais de chroma, ainda calmo)
    subtle: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [78, 95], cMin: 0.012, cMax: 0.1 },
        dark: { l: [10, 32], cMin: 0.012, cMax: 0.11 },
      },
    },
    // solid: backgrounds sólidos (chroma mais alto, pensado para onSolid)
    solid: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [46, 90], cMin: 0.03, cMax: 0.18, chromaBoost: 1.25 },
        dark: { l: [12, 42], cMin: 0.03, cMax: 0.2, chromaBoost: 1.25 },
      },
    },
    // overlay: modal surfaces/scrims (chroma baixo, controle forte de L)
    overlay: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [72, 96], cMin: 0.01, cMax: 0.09 },
        dark: { l: [14, 40], cMin: 0.01, cMax: 0.1 },
      },
    },
    // data: charts/heatmaps (pode usar chroma maior sem “gritar”)
    data: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [38, 86], cMin: 0.04, cMax: 0.22, chromaBoost: 1.3 },
        dark: { l: [18, 48], cMin: 0.04, cMax: 0.24, chromaBoost: 1.3 },
      },
    },
    // transparent: base quase neutra (chroma quase zero; usado para ghost)
    transparent: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [62, 96], cMin: 0, cMax: 0.06 },
        dark: { l: [8, 30], cMin: 0, cMax: 0.07 },
      },
    },
  },
};

export const radixLike: CurvePreset = {
  name: "radixLike",
  surfaces: {
    // app: fundo do app (separação mínima, chroma baixíssimo)
    app: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [92, 99], cMin: 0.003, cMax: 0.06 },
        dark: { l: [4, 18], cMin: 0.003, cMax: 0.08 },
      },
    },
    // surface: cards/panels (separação leve do app bg, chroma baixo)
    surface: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [86, 97], cMin: 0.006, cMax: 0.1 },
        dark: { l: [6, 24], cMin: 0.006, cMax: 0.11 },
      },
    },
    // subtle: tints/hover backgrounds (um pouco mais de chroma, ainda calmo)
    subtle: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [80, 94], cMin: 0.01, cMax: 0.12 },
        dark: { l: [8, 30], cMin: 0.01, cMax: 0.13 },
      },
    },
    // solid: backgrounds sólidos (chroma mais alto, pensado para onSolid)
    solid: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [50, 88], cMin: 0.035, cMax: 0.2, chromaBoost: 1.25 },
        dark: { l: [10, 38], cMin: 0.035, cMax: 0.22, chromaBoost: 1.25 },
      },
    },
    // overlay: modal surfaces/scrims (chroma baixo, controle forte de L)
    overlay: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [74, 96], cMin: 0.01, cMax: 0.11 },
        dark: { l: [12, 38], cMin: 0.01, cMax: 0.12 },
      },
    },
    // data: charts/heatmaps (pode usar chroma maior sem “gritar”)
    data: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [40, 84], cMin: 0.05, cMax: 0.24, chromaBoost: 1.3 },
        dark: { l: [16, 46], cMin: 0.05, cMax: 0.26, chromaBoost: 1.3 },
      },
    },
    // transparent: base quase neutra (chroma quase zero; usado para ghost)
    transparent: {
      l: lightnessCurve,
      c: chromaCurve,
      ranges: {
        light: { l: [60, 94], cMin: 0, cMax: 0.08 },
        dark: { l: [6, 28], cMin: 0, cMax: 0.09 },
      },
    },
  },
};

export const curvePresets: Record<CurvePresetName, CurvePreset> = {
  modern,
  radixLike,
};
