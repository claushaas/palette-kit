import Color from "colorjs.io";
import type { AlphaScale, ColorHex, Step } from "../types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const alphaCurve: Record<Step, number> = {
  1: 0.05,
  2: 0.1,
  3: 0.15,
  4: 0.2,
  5: 0.3,
  6: 0.4,
  7: 0.5,
  8: 0.6,
  9: 0.7,
  10: 0.8,
  11: 0.9,
  12: 0.95,
};

function mixWithAlpha(foreground: ColorHex, alpha: number): ColorHex {
  const color = new Color(foreground).to("srgb");
  const [r, g, b] = color.coords;
  const hex = new Color({ space: "srgb", coords: [r, g, b], alpha }).toString({
    format: "hex",
  });
  return hex as ColorHex;
}

export function generateAlphaScale(
  base: ColorHex,
  _background: { light: ColorHex; dark: ColorHex },
): AlphaScale {
  const light: Record<Step, ColorHex> = {} as Record<Step, ColorHex>;
  const dark: Record<Step, ColorHex> = {} as Record<Step, ColorHex>;

  for (const step of steps) {
    const alpha = alphaCurve[step];
    light[step] = mixWithAlpha(base, alpha);
    dark[step] = mixWithAlpha(base, alpha);
  }

  return { light, dark };
}
