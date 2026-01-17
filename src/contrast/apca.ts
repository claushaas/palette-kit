import { APCAcontrast, sRGBtoY } from "apca-w3";

import type { SrgbColor } from "./types.js";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toApcaInput = (color: SrgbColor): [number, number, number, number] => [
  clamp01(color.r) * 255,
  clamp01(color.g) * 255,
  clamp01(color.b) * 255,
  1,
];

export const computeApcaLc = (fg: SrgbColor, bg: SrgbColor): number => {
  const fgY = sRGBtoY(toApcaInput(fg));
  const bgY = sRGBtoY(toApcaInput(bg));
  const value = APCAcontrast(fgY, bgY);
  // Fail-soft to avoid propagating NaN into solver scoring.
  return Number.isFinite(value) ? value : 0;
};
