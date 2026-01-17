import { converter } from "culori";

import type { CssColorString, RawColor } from "../types/index.js";

const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const toOklch = converter("oklch");

const OKLCH_L_MAX = 100;
const OKLCH_H_MAX = 360;
const MAX_OKLCH_CHROMA = 0.4;
const NEGATIVE_CHROMA_EPSILON = 1e-6;

const toChannel = (hex: string) => Number.parseInt(hex, 16) / 255;

const normalizeHue = (hue: number) => ((hue % OKLCH_H_MAX) + OKLCH_H_MAX) % OKLCH_H_MAX;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function parseColor(input: CssColorString): {
  input: CssColorString;
  okLch: RawColor;
  srgb: RawColor;
} {
  const normalizedInput = input.trim();

  if (!hexPattern.test(normalizedInput)) {
    throw new Error(`Invalid color input: "${input}"`);
  }

  const hex = normalizedInput.slice(1);
  let r = 0;
  let g = 0;
  let b = 0;
  let alpha = 1;

  if (hex.length === 3) {
    r = toChannel(`${hex[0]}${hex[0]}`);
    g = toChannel(`${hex[1]}${hex[1]}`);
    b = toChannel(`${hex[2]}${hex[2]}`);
  } else if (hex.length === 6 || hex.length === 8) {
    r = toChannel(hex.slice(0, 2));
    g = toChannel(hex.slice(2, 4));
    b = toChannel(hex.slice(4, 6));

    if (hex.length === 8) {
      alpha = toChannel(hex.slice(6, 8));
    }
  } else {
    throw new Error(`Invalid hex length: "${normalizedInput}"`);
  }

  const oklchValue = toOklch({ mode: "rgb", r, g, b });

  if (!oklchValue) {
    throw new Error(`Unable to convert color input: "${normalizedInput}" (r=${r}, g=${g}, b=${b})`);
  }

  const l = typeof oklchValue.l === "number" && Number.isFinite(oklchValue.l) ? oklchValue.l : 0;
  const c = typeof oklchValue.c === "number" && Number.isFinite(oklchValue.c) ? oklchValue.c : 0;
  const h = typeof oklchValue.h === "number" && Number.isFinite(oklchValue.h) ? oklchValue.h : 0;
  const scaledLightness = l * 100;

  if (c < -NEGATIVE_CHROMA_EPSILON) {
    throw new Error(`Invalid OKLCH chroma value: ${c} for "${input}"`);
  }

  const okLch: RawColor = {
    space: "oklch",
    channels: [
      clamp(scaledLightness, 0, OKLCH_L_MAX),
      clamp(Math.max(0, c), 0, MAX_OKLCH_CHROMA),
      normalizeHue(h),
    ],
    alpha,
  };

  const srgb: RawColor = {
    space: "srgb",
    channels: [r, g, b],
    alpha,
  };

  return {
    input: normalizedInput,
    okLch,
    srgb,
  };
}
