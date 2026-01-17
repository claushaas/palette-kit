import { formatHex, formatHex8 } from "culori";
import { isInGamut, mapToGamut, toGamutRgb } from "../engine/gamut.js";
import type { OkLchColor } from "../engine/generateScale.js";
import type { ColorMeta, OutputOptions, RawColor, ResolvedColor } from "../types/index.js";
import { clamp } from "../utils/clamp.js";

type SerializeFormat = "css" | "json";

type NormalizedOutput = Required<
  Pick<OutputOptions, "preferSpace" | "includeSpaces" | "gamutMapping" | "strict">
> & {
  precision: Required<NonNullable<OutputOptions["precision"]>>;
  format: SerializeFormat;
  includeMeta: boolean;
};

type SerializedColorJson = {
  value: RawColor;
  srgb?: RawColor;
  p3?: RawColor;
  oklch?: RawColor;
  alpha: number;
  meta?: ColorMeta;
};

const DEFAULT_OUTPUT: NormalizedOutput = {
  preferSpace: "oklch",
  includeSpaces: [],
  gamutMapping: "preferP3ThenCompress",
  precision: { l: 1, c: 3, h: 1, alpha: 2 },
  strict: false,
  format: "css",
  includeMeta: false,
};

const roundTo = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const formatNumber = (value: number, digits: number) => {
  const rounded = roundTo(value, digits);
  if (digits === 0) {
    return String(Math.round(rounded));
  }
  const fixed = rounded.toFixed(digits);
  return fixed.replace(/\.?0+$/, "");
};

const normalizeOutput = (output?: OutputOptions): NormalizedOutput => ({
  preferSpace: output?.preferSpace ?? DEFAULT_OUTPUT.preferSpace,
  includeSpaces: output?.includeSpaces ?? DEFAULT_OUTPUT.includeSpaces,
  gamutMapping: output?.gamutMapping ?? DEFAULT_OUTPUT.gamutMapping,
  precision: {
    ...DEFAULT_OUTPUT.precision,
    ...output?.precision,
  },
  strict: output?.strict ?? DEFAULT_OUTPUT.strict,
  format: output?.format === "json" ? "json" : "css",
  includeMeta: output?.includeMeta ?? DEFAULT_OUTPUT.includeMeta,
});

const formatOklch = (color: OkLchColor, precision: NormalizedOutput["precision"]) => {
  const alpha = clamp(color.alpha ?? 1, 0, 1);
  const hasAlpha = alpha < 1;
  const l = formatNumber(clamp(color.l, 0, 100), precision.l);
  const c = formatNumber(Math.max(0, color.c), precision.c);
  const h = formatNumber(color.h, precision.h);
  const alphaPart = hasAlpha ? ` / ${formatNumber(alpha, precision.alpha)}` : "";
  return `oklch(${l}% ${c} ${h}${alphaPart})`;
};

const formatDisplayP3 = (
  rgb: { r: number; g: number; b: number },
  alpha: number,
  precision: NormalizedOutput["precision"],
) => {
  const r = formatNumber(clamp(rgb.r, 0, 1), precision.c);
  const g = formatNumber(clamp(rgb.g, 0, 1), precision.c);
  const b = formatNumber(clamp(rgb.b, 0, 1), precision.c);
  const alphaPart = alpha < 1 ? ` / ${formatNumber(alpha, precision.alpha)}` : "";
  return `color(display-p3 ${r} ${g} ${b}${alphaPart})`;
};

const formatSrgbHex = (rgb: { r: number; g: number; b: number }, alpha: number) => {
  const rgbColor = {
    mode: "rgb" as const,
    r: clamp(rgb.r, 0, 1),
    g: clamp(rgb.g, 0, 1),
    b: clamp(rgb.b, 0, 1),
    alpha,
  };
  return alpha < 1 ? formatHex8(rgbColor) : formatHex(rgbColor);
};

const toRawOklch = (color: OkLchColor, precision: NormalizedOutput["precision"]): RawColor => ({
  space: "oklch",
  channels: [
    roundTo(clamp(color.l, 0, 100), precision.l),
    roundTo(Math.max(0, color.c), precision.c),
    roundTo(color.h, precision.h),
  ],
  alpha: roundTo(clamp(color.alpha ?? 1, 0, 1), precision.alpha),
});

const toRawRgb = (
  rgb: { r: number; g: number; b: number },
  alpha: number,
  space: "srgb" | "p3",
  precision: NormalizedOutput["precision"],
): RawColor => ({
  space,
  channels: [
    roundTo(clamp(rgb.r, 0, 1), precision.c),
    roundTo(clamp(rgb.g, 0, 1), precision.c),
    roundTo(clamp(rgb.b, 0, 1), precision.c),
  ],
  alpha: roundTo(clamp(alpha, 0, 1), precision.alpha),
});

const buildMeta = (meta: ColorMeta | undefined, output: NormalizedOutput): ColorMeta | undefined =>
  output.includeMeta ? { ...meta, gamutMapping: output.gamutMapping } : undefined;

const resolveAlpha = (baseAlpha: number, mapped?: OkLchColor) =>
  clamp(mapped?.alpha ?? baseAlpha, 0, 1);

const requirePreferredSpace = (
  prefer: NormalizedOutput["preferSpace"],
  strict: boolean,
  value: string | undefined,
  fallback: string,
) => {
  if (!strict) return value ?? fallback;
  // In strict mode, if user explicitly prefers srgb/p3, do not silently fall back.
  if ((prefer === "srgb" || prefer === "p3") && !value) {
    throw new Error(`Unable to serialize preferred space: ${prefer}`);
  }
  return value ?? fallback;
};

export const serializeColor = (
  color: OkLchColor,
  output?: OutputOptions,
  meta?: ColorMeta,
): ResolvedColor => {
  const normalized = normalizeOutput(output);
  const alpha = clamp(color.alpha ?? 1, 0, 1);
  const spaces = new Set([normalized.preferSpace, ...normalized.includeSpaces]);

  const oklchText = formatOklch(color, normalized.precision);

  const needsSrgb = spaces.has("srgb") || normalized.preferSpace === "srgb";
  const srgbColor = needsSrgb
    ? mapToGamut(color, "srgb", normalized.gamutMapping, normalized.strict)
    : undefined;
  const srgbRgb = srgbColor ? toGamutRgb(srgbColor, "srgb") : null;
  const srgbAlpha = resolveAlpha(alpha, srgbColor);
  const srgbText = srgbRgb ? formatSrgbHex(srgbRgb, srgbAlpha) : undefined;

  const needsP3 = spaces.has("p3") || normalized.preferSpace === "p3";
  const p3Color = needsP3
    ? normalized.gamutMapping === "preferP3ThenCompress" && isInGamut(color, "p3")
      ? color
      : mapToGamut(color, "p3", normalized.gamutMapping, normalized.strict)
    : undefined;
  const p3Rgb = p3Color ? toGamutRgb(p3Color, "p3") : null;
  const p3Alpha = resolveAlpha(alpha, p3Color);
  const p3Text = p3Rgb ? formatDisplayP3(p3Rgb, p3Alpha, normalized.precision) : undefined;

  const value = (() => {
    if (normalized.preferSpace === "srgb") {
      return requirePreferredSpace("srgb", normalized.strict, srgbText, oklchText);
    }
    if (normalized.preferSpace === "p3") {
      return requirePreferredSpace("p3", normalized.strict, p3Text, oklchText);
    }
    return oklchText;
  })();

  return {
    value,
    srgb: spaces.has("srgb") ? srgbText : undefined,
    p3: spaces.has("p3") ? p3Text : undefined,
    oklch: spaces.has("oklch") ? oklchText : undefined,
    alpha,
    meta: buildMeta(meta, normalized),
  };
};

export const serializeColorJson = (
  color: OkLchColor,
  output?: OutputOptions,
  meta?: ColorMeta,
): SerializedColorJson => {
  const normalized = normalizeOutput(output);
  const alpha = clamp(color.alpha ?? 1, 0, 1);
  const spaces = new Set([normalized.preferSpace, ...normalized.includeSpaces]);

  const needsSrgb = spaces.has("srgb") || normalized.preferSpace === "srgb";
  const srgbColor = needsSrgb
    ? mapToGamut(color, "srgb", normalized.gamutMapping, normalized.strict)
    : undefined;
  const srgbRgb = srgbColor ? toGamutRgb(srgbColor, "srgb") : null;
  const srgbAlpha = resolveAlpha(alpha, srgbColor);
  const needsP3 = spaces.has("p3") || normalized.preferSpace === "p3";
  const p3Color = needsP3
    ? normalized.gamutMapping === "preferP3ThenCompress" && isInGamut(color, "p3")
      ? color
      : mapToGamut(color, "p3", normalized.gamutMapping, normalized.strict)
    : undefined;
  const p3Rgb = p3Color ? toGamutRgb(p3Color, "p3") : null;
  const p3Alpha = resolveAlpha(alpha, p3Color);

  const value =
    normalized.preferSpace === "srgb"
      ? srgbRgb
        ? toRawRgb(srgbRgb, srgbAlpha, "srgb", normalized.precision)
        : normalized.strict
          ? (() => {
              throw new Error("Unable to serialize preferred space: srgb");
            })()
          : toRawOklch(color, normalized.precision)
      : normalized.preferSpace === "p3"
        ? p3Rgb
          ? toRawRgb(p3Rgb, p3Alpha, "p3", normalized.precision)
          : normalized.strict
            ? (() => {
                throw new Error("Unable to serialize preferred space: p3");
              })()
            : toRawOklch(color, normalized.precision)
        : toRawOklch(color, normalized.precision);

  return {
    value,
    srgb:
      spaces.has("srgb") && srgbRgb
        ? toRawRgb(srgbRgb, srgbAlpha, "srgb", normalized.precision)
        : undefined,
    p3:
      spaces.has("p3") && p3Rgb ? toRawRgb(p3Rgb, p3Alpha, "p3", normalized.precision) : undefined,
    oklch: spaces.has("oklch") ? toRawOklch(color, normalized.precision) : undefined,
    alpha: roundTo(alpha, normalized.precision.alpha),
    meta: buildMeta(meta, normalized),
  };
};
