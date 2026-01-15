import { generateAlphaScale } from "./alpha/generateAlphaScale.js";
import { onSolidTextTokens } from "./contrast/onSolid.js";
import { analyzeTheme } from "./diagnostics/analyzeTheme.js";
import type { GenerateScaleOptions } from "./generateScale.js";
import { generateScale } from "./generateScale.js";
import { generateOverlayScale } from "./overlays/generateOverlayScale.js";
import { generateTextScale } from "./text/generateTextScale.js";
import { buildPresetTokens } from "./tokens/presetRadixLikeUi.js";
import type {
  AlphaScales,
  ColorHex,
  ColorSource,
  OverlayScale,
  Scale,
  Step,
  Theme,
} from "./types.js";

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
  text?: {
    darkBase?: ColorHex;
    lightBase?: ColorHex;
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

  const accentScale = scales.accent;
  const lightOnSolid = onSolidTextTokens(accentScale.light[9]);
  const darkOnSolid = onSolidTextTokens(accentScale.dark[9]);

  tokens.light["onSolid.primary"] = lightOnSolid.primary;
  tokens.light["onSolid.secondary"] = lightOnSolid.secondary;
  tokens.light["onSolid.disabled"] = lightOnSolid.disabled;
  tokens.dark["onSolid.primary"] = darkOnSolid.primary;
  tokens.dark["onSolid.secondary"] = darkOnSolid.secondary;
  tokens.dark["onSolid.disabled"] = darkOnSolid.disabled;

  const textScale = generateTextScale({
    darkBase: options.text?.darkBase,
    lightBase: options.text?.lightBase,
  });

  const darkTextSteps = {
    primary: 12,
    secondary: 10,
    tertiary: 9,
    disabled: 8,
  } as const;
  const lightTextSteps = {
    primary: 1,
    secondary: 3,
    tertiary: 4,
    disabled: 5,
  } as const;
  const midDarkTextSteps = {
    primary: 12,
    secondary: 11,
  } as const;
  const midLightTextSteps = {
    primary: 1,
    secondary: 3,
  } as const;

  const onBgLightMode = {
    light: { scale: "dark", steps: darkTextSteps },
    mid: { scale: "dark", steps: midDarkTextSteps },
    dark: { scale: "light", steps: lightTextSteps },
  } as const;
  const onBgDarkMode = {
    light: { scale: "light", steps: lightTextSteps },
    mid: { scale: "light", steps: midLightTextSteps },
    dark: { scale: "dark", steps: darkTextSteps },
  } as const;

  const applyOnBgTokens = (
    target: Record<string, ColorHex>,
    mapping: typeof onBgLightMode,
  ) => {
    for (const [zone, config] of Object.entries(mapping)) {
      const scale = config.scale === "dark" ? textScale.dark : textScale.light;
      for (const [role, step] of Object.entries(config.steps)) {
        target[`text.onBg.${zone}.${role}`] = scale[step as Step];
      }
    }
  };

  for (const [step, value] of Object.entries(textScale.dark)) {
    tokens.light[`text.dark.${step}`] = value;
    tokens.dark[`text.dark.${step}`] = value;
  }
  for (const [step, value] of Object.entries(textScale.light)) {
    tokens.light[`text.light.${step}`] = value;
    tokens.dark[`text.light.${step}`] = value;
  }

  for (const [key, step] of Object.entries(darkTextSteps)) {
    const token = `text.dark.${key}`;
    tokens.light[token] = textScale.dark[step];
    tokens.dark[token] = textScale.dark[step];
  }
  for (const [key, step] of Object.entries(lightTextSteps)) {
    const token = `text.light.${key}`;
    tokens.light[token] = textScale.light[step];
    tokens.dark[token] = textScale.light[step];
  }

  applyOnBgTokens(tokens.light, onBgLightMode);
  applyOnBgTokens(tokens.dark, onBgDarkMode);

  tokens.light["text.primary"] = tokens.light["text.onBg.light.primary"];
  tokens.light["text.secondary"] = tokens.light["text.onBg.light.secondary"];
  tokens.light["text.tertiary"] = tokens.light["text.onBg.light.tertiary"];
  tokens.light["text.disabled"] = tokens.light["text.onBg.light.disabled"];
  tokens.dark["text.primary"] = tokens.dark["text.onBg.light.primary"];
  tokens.dark["text.secondary"] = tokens.dark["text.onBg.light.secondary"];
  tokens.dark["text.tertiary"] = tokens.dark["text.onBg.light.tertiary"];
  tokens.dark["text.disabled"] = tokens.dark["text.onBg.light.disabled"];

  if (options.tokens?.overrides?.light) {
    Object.assign(tokens.light, options.tokens.overrides.light);
  }
  if (options.tokens?.overrides?.dark) {
    Object.assign(tokens.dark, options.tokens.overrides.dark);
  }

  let alpha: AlphaScales | undefined;
  if (options.alpha?.enabled !== false) {
    const background = {
      light: options.alpha?.background?.light ?? "#ffffff",
      dark: options.alpha?.background?.dark ?? "#111111",
    } as const;
    alpha = Object.fromEntries(
      Object.entries(scales).map(([slot, scale]) => [
        slot,
        generateAlphaScale(scale.light[9], background),
      ]),
    );
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
