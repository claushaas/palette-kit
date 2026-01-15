import { compressToSrgb, hexToOklch, oklchToHex } from "../engine/oklch.js";
import type { ColorHex, Step, TextScale } from "../types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type TextScaleOptions = {
  darkBase?: ColorHex;
  lightBase?: ColorHex;
  deltaL?: number;
};

export function generateTextScale(options?: TextScaleOptions): TextScale {
  const darkBase = options?.darkBase ?? "#1C1C1E";
  const lightBase = options?.lightBase ?? "#F5F5F7";
  const deltaL = options?.deltaL ?? 0.055;

  const darkBaseOklch = hexToOklch(darkBase);
  const lightBaseOklch = hexToOklch(lightBase);

  const dark: Record<Step, ColorHex> = {} as Record<Step, ColorHex>;
  const light: Record<Step, ColorHex> = {} as Record<Step, ColorHex>;

  for (const step of steps) {
    const darkL = Math.min(darkBaseOklch.l + (12 - step) * deltaL, 0.92);
    const lightL = Math.max(lightBaseOklch.l - (step - 1) * deltaL, 0.12);

    dark[step] = oklchToHex(
      compressToSrgb({ ...darkBaseOklch, l: darkL }),
    );
    light[step] = oklchToHex(
      compressToSrgb({ ...lightBaseOklch, l: lightL }),
    );
  }

  return { dark, light };
}
