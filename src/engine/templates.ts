import type { OklchColor, Step, TemplateId } from "../types.js";

const steps: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const lightnessLight = [0.99, 0.97, 0.94, 0.91, 0.88, 0.84, 0.78, 0.7, 0.6, 0.52, 0.42, 0.3];
const lightnessDark = [0.12, 0.14, 0.17, 0.2, 0.24, 0.29, 0.36, 0.44, 0.54, 0.62, 0.72, 0.82];

const chromaNeutral = [0.01, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.05, 0.04, 0.03];
const chromaWarm = [0.02, 0.03, 0.05, 0.08, 0.12, 0.16, 0.18, 0.2, 0.22, 0.2, 0.16, 0.12];
const chromaCool = [0.02, 0.03, 0.05, 0.07, 0.1, 0.14, 0.17, 0.19, 0.21, 0.19, 0.15, 0.11];

const baseHue: Record<TemplateId, number> = {
  neutral: 250,
  warm: 40,
  cool: 220,
};

function buildTemplate(
  lightness: number[],
  chroma: number[],
  hue: number
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
