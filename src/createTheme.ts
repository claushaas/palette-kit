import type { ColorHex, ColorSource, Scale, Theme } from "./types.js";
import { generateScale } from "./generateScale.js";
import { buildPresetTokens } from "./tokens/presetRadixLikeUi.js";

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
