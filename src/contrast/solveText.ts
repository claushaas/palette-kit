import Color from "colorjs.io";
import { compressToSrgb, oklchToHex } from "../engine/oklch.js";
import type { ColorHex, OklchColor } from "../types.js";
import { apcaContrast } from "./apca.js";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function adjustLightness(
  oklch: OklchColor,
  background: ColorHex,
  target: number,
  maxIterations = 24,
): OklchColor {
  const bg = new Color(background).to("oklch");
  const bgL = bg.coords[0];
  const direction = bgL > 0.5 ? -1 : 1;
  let current = { ...oklch };

  for (let i = 0; i < maxIterations; i += 1) {
    const contrast = Math.abs(apcaContrast(oklchToHex(current), background));
    if (contrast >= target) {
      return current;
    }

    current = {
      ...current,
      l: clamp(current.l + direction * 0.02, 0, 1),
    };
  }

  return current;
}

export function adjustTextColor(
  foreground: ColorHex,
  background: ColorHex,
  target: number,
): ColorHex {
  const fg = new Color(foreground).to("oklch");
  const [l, c, h] = fg.coords;
  let candidate: OklchColor = { l, c, h };

  candidate = adjustLightness(candidate, background, target);
  candidate = compressToSrgb(candidate);

  return oklchToHex(candidate);
}
