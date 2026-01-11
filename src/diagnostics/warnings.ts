import Color from "colorjs.io";
import type { Theme } from "../types.js";

export function analyzeWarnings(theme: Theme): string[] {
  const warnings: string[] = [];

  const accent = theme.scales.accent?.light?.[9];
  if (accent) {
    const { coords } = new Color(accent).to("oklch");
    const l = coords[0] ?? 0;
    const c = coords[1] ?? 0;

    if (c < 0.03) {
      warnings.push("Accent seed has very low chroma; the palette may look gray.");
    }
    if (l < 0.2) {
      warnings.push("Accent seed is very dark; light mode solids may lack contrast.");
    }
    if (l > 0.9) {
      warnings.push("Accent seed is very light; dark mode solids may lack contrast.");
    }
  }

  return warnings;
}
