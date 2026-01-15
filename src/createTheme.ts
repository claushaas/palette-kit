import { generateAlphaScale } from "./alpha/generateAlphaScale.js";
import { onSolidTextTokens } from "./contrast/onSolid.js";
import { adjustTextColor } from "./contrast/solveText.js";
import { analyzeTheme } from "./diagnostics/analyzeTheme.js";
import type { GenerateScaleOptions } from "./generateScale.js";
import { generateScale } from "./generateScale.js";
import { generateOverlayScale } from "./overlays/generateOverlayScale.js";
import { buildPresetTokens } from "./tokens/presetRadixLikeUi.js";
import type { AlphaScale, ColorHex, ColorSource, OverlayScale, Scale, Theme } from "./types.js";

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
  alpha?: {
    enabled?: boolean;
    background?: { light?: ColorHex; dark?: ColorHex };
  };
  contrast?: {
    textPrimary?: number;
    textSecondary?: number;
  };
  scale?: Omit<GenerateScaleOptions, "source" | "mode" | "p3">;
  p3?: boolean;
};

export function createTheme(options: CreateThemeOptions): Theme {
  const includeP3 = options.p3 ?? false;
  const scaleOptions = options.scale ?? {};
  const scales: Record<string, Scale> = {
    neutral: generateScale({ source: options.neutral, ...scaleOptions, p3: includeP3 }),
    accent: generateScale({ source: options.accent, ...scaleOptions, p3: includeP3 }),
  };

  if (options.semantic?.success) {
    scales.success = generateScale({
      source: options.semantic.success,
      ...scaleOptions,
      p3: includeP3,
    });
  }
  if (options.semantic?.warning) {
    scales.warning = generateScale({
      source: options.semantic.warning,
      ...scaleOptions,
      p3: includeP3,
    });
  }
  if (options.semantic?.danger) {
    scales.danger = generateScale({
      source: options.semantic.danger,
      ...scaleOptions,
      p3: includeP3,
    });
  }

  if (options.extras) {
    for (const [key, source] of Object.entries(options.extras)) {
      scales[key] = generateScale({ source, ...scaleOptions, p3: includeP3 });
    }
  }

  const preset = options.tokens?.preset ?? "radix-like-ui";
  const tokens = preset === "radix-like-ui" ? buildPresetTokens(scales) : { light: {}, dark: {} };

  const lightBg = tokens.light["bg.app"];
  const darkBg = tokens.dark["bg.app"];
  const textPrimaryTarget = options.contrast?.textPrimary ?? 75;
  const textSecondaryTarget = options.contrast?.textSecondary ?? 60;

  if (lightBg && tokens.light["text.primary"]) {
    tokens.light["text.primary"] = adjustTextColor(
      tokens.light["text.primary"],
      lightBg,
      textPrimaryTarget,
    );
  }
  if (lightBg && tokens.light["text.secondary"]) {
    tokens.light["text.secondary"] = adjustTextColor(
      tokens.light["text.secondary"],
      lightBg,
      textSecondaryTarget,
    );
  }
  if (darkBg && tokens.dark["text.primary"]) {
    tokens.dark["text.primary"] = adjustTextColor(
      tokens.dark["text.primary"],
      darkBg,
      textPrimaryTarget,
    );
  }
  if (darkBg && tokens.dark["text.secondary"]) {
    tokens.dark["text.secondary"] = adjustTextColor(
      tokens.dark["text.secondary"],
      darkBg,
      textSecondaryTarget,
    );
  }

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

  let alpha: AlphaScale | undefined;
  if (options.alpha?.enabled !== false) {
    const background = {
      light: options.alpha?.background?.light ?? "#ffffff",
      dark: options.alpha?.background?.dark ?? "#111111",
    } as const;
    alpha = generateAlphaScale(accentScale.light[9], background);
  }

  const overlay: OverlayScale = generateOverlayScale();

  const diagnostics = analyzeTheme({ scales, tokens, alpha, overlay });

  return {
    scales,
    tokens,
    alpha,
    overlay,
    diagnostics,
  };
}
