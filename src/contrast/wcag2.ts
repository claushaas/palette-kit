import type { SrgbColor } from "./types.js";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toLinear = (channel: number) => {
  const value = clamp01(channel);
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (color: SrgbColor): number => {
  const r = toLinear(color.r);
  const g = toLinear(color.g);
  const b = toLinear(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (fg: SrgbColor, bg: SrgbColor): number => {
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number.isFinite(ratio) ? ratio : Number.NaN;
};
