import { APCAcontrast, sRGBtoY } from "apca-w3";

import type { SrgbColor } from "./types.js";

// NOTE:
// sRGBtoY expects 0-255 RGB values (3-tuple). Also APCA impl can yield
// a string|number, so normalize to number before Number.isFinite.

type SrgbTriplet = [r: number, g: number, b: number];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toApcaInput = (color: SrgbColor): SrgbTriplet => [
  clamp01(color.r) * 255,
  clamp01(color.g) * 255,
  clamp01(color.b) * 255,
];

export function computeApcaLc(fg: SrgbColor, bg: SrgbColor): number {
  const fgY = sRGBtoY(toApcaInput(fg));
  const bgY = sRGBtoY(toApcaInput(bg));
  const raw = APCAcontrast(fgY, bgY);
  const value = typeof raw === "number" ? raw : Number(raw);
  // Fail-soft to avoid propagating NaN into solver scoring.
  return Number.isFinite(value) ? value : 0;
}
