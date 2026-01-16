import { converter } from "culori";

import type { CssColorString, RawColor } from "../types/index.js";

const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const toOklch = converter("oklch");

const toChannel = (hex: string) => Number.parseInt(hex, 16) / 255;

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

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
  }

  const oklchValue = toOklch({ mode: "rgb", r, g, b });

  if (!oklchValue) {
    throw new Error(`Unable to convert color input: "${input}"`);
  }

  const l = Number.isFinite(oklchValue.l) ? oklchValue.l : 0;
  const c = Number.isFinite(oklchValue.c) ? oklchValue.c : 0;
  const h = Number.isFinite(oklchValue.h) ? oklchValue.h : 0;

  const okLch: RawColor = {
    space: "oklch",
    channels: [Math.max(0, l * 100), Math.max(0, c), normalizeHue(h)],
    alpha,
  };

  const srgb: RawColor = {
    space: "srgb",
    channels: [r, g, b],
    alpha,
  };

  return {
    input,
    okLch,
    srgb,
  };
}
