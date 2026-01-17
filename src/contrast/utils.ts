import { converter } from "culori";

import type { OkLchColor } from "../engine/generateScale.js";
import type { SrgbColor } from "./types.js";

const toSrgb = converter("rgb");

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const toSrgbColor = (color: OkLchColor): SrgbColor | null => {
  const rgb = toSrgb({ mode: "oklch", l: clamp(color.l, 0, 100) / 100, c: color.c, h: color.h });

  if (!rgb) {
    return null;
  }

  const r = typeof rgb.r === "number" && Number.isFinite(rgb.r) ? clamp(rgb.r, 0, 1) : 0;
  const g = typeof rgb.g === "number" && Number.isFinite(rgb.g) ? clamp(rgb.g, 0, 1) : 0;
  const b = typeof rgb.b === "number" && Number.isFinite(rgb.b) ? clamp(rgb.b, 0, 1) : 0;

  return { r, g, b };
};

export const blendSrgb = (fg: SrgbColor, bg: SrgbColor, alpha: number): SrgbColor => ({
  r: fg.r * alpha + bg.r * (1 - alpha),
  g: fg.g * alpha + bg.g * (1 - alpha),
  b: fg.b * alpha + bg.b * (1 - alpha),
});
