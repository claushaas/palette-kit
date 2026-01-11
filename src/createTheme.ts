import { onSolidTextTokens } from "./contrast/onSolid.js";
import { generateScale } from "./generateScale.js";
import { buildPresetTokens } from "./tokens/presetRadixLikeUi.js";
import type { ColorHex, ColorSource, Scale, Theme } from "./types.js";

export type TokenOverrides = {
  light?: Record<string, ColorHex>;
  dark?: Record<string, ColorHex>;
};

export type CreateThemeOptions = {
  neutral: ColorSource;
  accent: ColorSource;
  semantic?: {
    success?: ColorSource;
    warning?: ColorSource;
    danger?: ColorSource;
  };
  extras?: Record<string, ColorSource>;
  tokens?: { preset?: "radix-like-ui"; overrides?: TokenOverrides };
};

export function createTheme(options: CreateThemeOptions): Theme {
  const scales: Record<string, Scale> = {
    neutral: generateScale({ source: options.neutral }),
    accent: generateScale({ source: options.accent }),
  };

  if (options.semantic?.success) {
    scales.success = generateScale({ source: options.semantic.success });
  }
  if (options.semantic?.warning) {
    scales.warning = generateScale({ source: options.semantic.warning });
  }
  if (options.semantic?.danger) {
    scales.danger = generateScale({ source: options.semantic.danger });
  }

  if (options.extras) {
    for (const [key, source] of Object.entries(options.extras)) {
      scales[key] = generateScale({ source });
    }
  }

  const preset = options.tokens?.preset ?? "radix-like-ui";
  const tokens = preset === "radix-like-ui" ? buildPresetTokens(scales) : { light: {}, dark: {} };

  const accentScale = scales.accent;
  const lightOnSolid = onSolidTextTokens(accentScale.light[9]);
  const darkOnSolid = onSolidTextTokens(accentScale.dark[9]);

  tokens.light["onSolid.primary"] = lightOnSolid.primary;
  tokens.light["onSolid.secondary"] = lightOnSolid.secondary;
  tokens.light["onSolid.disabled"] = lightOnSolid.disabled;
  tokens.dark["onSolid.primary"] = darkOnSolid.primary;
  tokens.dark["onSolid.secondary"] = darkOnSolid.secondary;
  tokens.dark["onSolid.disabled"] = darkOnSolid.disabled;

  if (options.tokens?.overrides?.light) {
    Object.assign(tokens.light, options.tokens.overrides.light);
  }
  if (options.tokens?.overrides?.dark) {
    Object.assign(tokens.dark, options.tokens.overrides.dark);
  }

  return {
    scales,
    tokens,
  };
}
