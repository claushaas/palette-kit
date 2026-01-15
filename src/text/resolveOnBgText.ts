import type { ColorHex, Step, Theme } from "../types.js";

export type TextOnBgTokens = {
  zone: "light" | "mid" | "dark";
  primary: ColorHex;
  secondary: ColorHex;
  tertiary?: ColorHex;
  disabled?: ColorHex;
};

function resolveZone(step: Step): "light" | "mid" | "dark" {
  if (step <= 4) {
    return "light";
  }
  if (step <= 8) {
    return "mid";
  }
  return "dark";
}

export function resolveOnBgTextTokens(
  theme: Theme,
  mode: "light" | "dark",
  backgroundStep: Step,
): TextOnBgTokens {
  const zone = resolveZone(backgroundStep);
  const tokens = theme.tokens[mode];
  const prefix = `text.onBg.${zone}`;
  const primary = tokens[`${prefix}.primary`];
  const secondary = tokens[`${prefix}.secondary`];

  if (!primary || !secondary) {
    throw new Error(`Missing text.onBg tokens for ${mode} ${zone}.`);
  }

  const tertiary = tokens[`${prefix}.tertiary`];
  const disabled = tokens[`${prefix}.disabled`];

  return {
    zone,
    primary,
    secondary,
    tertiary: tertiary || undefined,
    disabled: disabled || undefined,
  };
}
