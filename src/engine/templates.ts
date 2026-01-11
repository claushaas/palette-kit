import type { OklchColor, Step, TemplateId } from "../types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const lightnessLight = [0.99, 0.975, 0.95, 0.92, 0.89, 0.84, 0.77, 0.68, 0.58, 0.5, 0.4, 0.3];
const lightnessDark = [0.12, 0.14, 0.18, 0.22, 0.26, 0.32, 0.4, 0.48, 0.58, 0.66, 0.76, 0.86];

const chromaNeutral = [
  0.01, 0.012, 0.016, 0.02, 0.024, 0.03, 0.04, 0.05, 0.055, 0.045, 0.035, 0.028,
];
const chromaWarm = [0.02, 0.03, 0.05, 0.08, 0.12, 0.16, 0.18, 0.2, 0.22, 0.19, 0.12, 0.08];
const chromaCool = [0.02, 0.03, 0.05, 0.075, 0.1, 0.14, 0.17, 0.19, 0.21, 0.18, 0.11, 0.08];

const baseHue: Record<TemplateId, number> = {
  neutral: 250,
  warm: 40,
  cool: 220,
};

function buildTemplate(
  lightness: number[],
  chroma: number[],
  hue: number,
): Record<Step, OklchColor> {
  const output = {} as Record<Step, OklchColor>;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    output[step] = {
      l: lightness[i],
      c: chroma[i],
      h: hue,
    };
  }
  return output;
}

export const templates = {
  light: {
    neutral: buildTemplate(lightnessLight, chromaNeutral, baseHue.neutral),
    warm: buildTemplate(lightnessLight, chromaWarm, baseHue.warm),
    cool: buildTemplate(lightnessLight, chromaCool, baseHue.cool),
  },
  dark: {
    neutral: buildTemplate(lightnessDark, chromaNeutral, baseHue.neutral),
    warm: buildTemplate(lightnessDark, chromaWarm, baseHue.warm),
    cool: buildTemplate(lightnessDark, chromaCool, baseHue.cool),
  },
};

export function selectTemplateId(oklch: OklchColor): TemplateId {
  if (oklch.c < 0.05) {
    return "neutral";
  }

  const hue = ((oklch.h % 360) + 360) % 360;
  const isWarm = hue <= 60 || hue >= 330;
  return isWarm ? "warm" : "cool";
}
