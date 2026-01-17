import { clampChroma, converter } from "culori";

import type { OutputOptions } from "../types/index.js";
import { clamp } from "../utils/clamp.js";
import type { OkLchColor } from "./generateScale.js";

export type GamutTarget = "srgb" | "p3";
export type GamutMapping = NonNullable<OutputOptions["gamutMapping"]>;

type GamutRgb = { r: number; g: number; b: number };
type CuloriOklch = { mode: "oklch"; l: number; c: number; h: number; alpha?: number };

const toRgb = converter("rgb");
const toP3 = converter("p3");
const toOklch = converter("oklch");

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

const toCuloriOklch = (color: OkLchColor): CuloriOklch => ({
  mode: "oklch",
  l: clamp(color.l, 0, 100) / 100,
  c: Math.max(0, color.c),
  h: color.h,
  alpha: color.alpha ?? 1,
});

const fromCuloriOklch = (color: { l?: number; c?: number; h?: number; alpha?: number }) => ({
  l: clamp(typeof color.l === "number" && Number.isFinite(color.l) ? color.l * 100 : 0, 0, 100),
  c: Math.max(0, typeof color.c === "number" && Number.isFinite(color.c) ? color.c : 0),
  h: normalizeHue(typeof color.h === "number" && Number.isFinite(color.h) ? color.h : 0),
  ...(typeof color.alpha === "number" ? { alpha: color.alpha } : {}),
});

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toTargetRgb = (color: OkLchColor, target: GamutTarget): GamutRgb | null => {
  const source = toCuloriOklch(color);
  const rgb = target === "p3" ? toP3(source) : toRgb(source);

  if (!rgb) {
    return null;
  }

  const r = typeof rgb.r === "number" && Number.isFinite(rgb.r) ? rgb.r : Number.NaN;
  const g = typeof rgb.g === "number" && Number.isFinite(rgb.g) ? rgb.g : Number.NaN;
  const b = typeof rgb.b === "number" && Number.isFinite(rgb.b) ? rgb.b : Number.NaN;

  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return null;
  }

  return { r, g, b };
};

const toOklchFromRgb = (rgb: GamutRgb, target: GamutTarget) => {
  const converted = toOklch({
    mode: (target === "p3" ? "p3" : "rgb") as "p3" | "rgb",
    r: clamp01(rgb.r),
    g: clamp01(rgb.g),
    b: clamp01(rgb.b),
  });

  if (!converted) {
    return null;
  }

  return fromCuloriOklch(converted);
};

const GAMUT_EPSILON = 1e-6;

const inGamut = (rgb: GamutRgb | null) =>
  !!rgb &&
  Number.isFinite(rgb.r) &&
  Number.isFinite(rgb.g) &&
  Number.isFinite(rgb.b) &&
  rgb.r >= -GAMUT_EPSILON &&
  rgb.r <= 1 + GAMUT_EPSILON &&
  rgb.g >= -GAMUT_EPSILON &&
  rgb.g <= 1 + GAMUT_EPSILON &&
  rgb.b >= -GAMUT_EPSILON &&
  rgb.b <= 1 + GAMUT_EPSILON;

const fallbackColor = (color: OkLchColor): OkLchColor => ({
  l: 0,
  c: 0,
  h: 0,
  alpha: color.alpha ?? 1,
});

export const isInGamut = (color: OkLchColor, target: GamutTarget): boolean =>
  inGamut(toTargetRgb(color, target));

export const mapToGamut = (
  color: OkLchColor,
  target: GamutTarget,
  mapping: GamutMapping,
  strict: boolean,
): OkLchColor => {
  // Note:
  // `preferP3ThenCompress` is primarily a caller-level strategy (e.g. serializeColor prefers P3 when possible).
  // Inside this mapper, any non-clip mapping uses chroma clamping (clampChroma) when mapping is needed.

  const rgb = toTargetRgb(color, target);

  if (!rgb) {
    if (strict) {
      throw new Error(`Unable to convert color to ${target}`);
    }
    return fallbackColor(color);
  }

  if (mapping === "clip") {
    if (inGamut(rgb)) {
      return color;
    }

    const clipped = { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) };
    const clippedOklch = toOklchFromRgb(clipped, target);
    return clippedOklch ?? fallbackColor(color);
  }

  if (inGamut(rgb)) {
    return color;
  }

  const clamped = clampChroma(toCuloriOklch(color), "oklch", target === "p3" ? "p3" : "rgb");
  if (!clamped) {
    if (strict) {
      throw new Error(`Unable to clamp chroma for ${target}`);
    }
    return fallbackColor(color);
  }

  return fromCuloriOklch(clamped);
};

export const toGamutRgb = (color: OkLchColor, target: GamutTarget): GamutRgb | null =>
  toTargetRgb(color, target);
