import { formatHex, formatHex8 } from "culori";
import { isInGamut, mapToGamut, toGamutRgb } from "../engine/gamut.js";
import type { OkLchColor } from "../engine/generateScale.js";
import type { BaseResolvedColor } from "../engine/resolveBaseColor.js";
import type { ColorMeta, OutputOptions, ResolvedColor } from "../types/index.js";
import { clamp } from "../utils/clamp.js";
import { normalizeOutput, type NormalizedOutput } from "./normalizeOutput.js";

type SerializedColorJson = ResolvedColor;

type SerializationDiagnostics = {
  spaceUsed: NonNullable<OutputOptions["preferSpace"]>;
  clipped?: boolean;
  compressed?: boolean;
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

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

const formatOklch = (color: OkLchColor, precision: NormalizedOutput["precision"]) => {
  const alpha = clamp(color.alpha ?? 1, 0, 1);
  const hasAlpha = alpha < 1;
  const l = formatNumber(clamp(color.l, 0, 100), precision.l);
  const c = formatNumber(Math.max(0, color.c), precision.c);
  const h = formatNumber(normalizeHue(color.h), precision.h);
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

const formatSrgbFunction = (
  rgb: { r: number; g: number; b: number },
  alpha: number,
  precision: NormalizedOutput["precision"],
  forceAlpha: boolean,
) => {
  const toChannel = (value: number) => String(Math.round(clamp(value, 0, 1) * 255));
  const r = toChannel(rgb.r);
  const g = toChannel(rgb.g);
  const b = toChannel(rgb.b);

  if (forceAlpha || alpha < 1) {
    return `rgba(${r} ${g} ${b} / ${formatNumber(alpha, precision.alpha)})`;
  }

  return `rgb(${r} ${g} ${b})`;
};

const formatSrgb = (
  rgb: { r: number; g: number; b: number },
  alpha: number,
  output: NormalizedOutput,
) => {
  switch (output.srgbFormat) {
    case "rgb":
      return formatSrgbFunction(rgb, alpha, output.precision, false);
    case "rgba":
      return formatSrgbFunction(rgb, alpha, output.precision, true);
    default:
      return formatSrgbHex(rgb, alpha);
  }
};

const buildDiagnostics = (
  spaceUsed: SerializationDiagnostics["spaceUsed"],
  clipped?: boolean,
  compressed?: boolean,
): SerializationDiagnostics => ({
  spaceUsed,
  ...(clipped ? { clipped } : {}),
  ...(compressed ? { compressed } : {}),
});

const buildMeta = (
  meta: ColorMeta | undefined,
  output: NormalizedOutput,
  diagnostics: SerializationDiagnostics,
): ColorMeta | undefined =>
  output.includeMeta
    ? {
        ...meta,
        spaceUsed: diagnostics.spaceUsed,
        gamutMapping: output.gamutMapping,
        ...(diagnostics.clipped ? { clipped: diagnostics.clipped } : {}),
        ...(diagnostics.compressed ? { compressed: diagnostics.compressed } : {}),
      }
    : undefined;

const resolveAlpha = (baseAlpha: number, mapped?: OkLchColor) =>
  clamp(mapped?.alpha ?? baseAlpha, 0, 1);

const requirePreferredSpace = (
  prefer: NormalizedOutput["preferSpace"],
  strict: boolean,
  value: string | undefined,
  fallback: string,
) => {
  if (!strict) return value ?? fallback;
  // In strict mode, do not silently fall back for explicit non-oklch preferences.
  if (prefer !== "oklch" && !value) {
    throw new Error(`Unable to serialize preferred space: ${prefer}`);
  }
  return value ?? fallback;
};

const resolveUsedSpace = (
  prefer: NormalizedOutput["preferSpace"],
  preferredValue: string | undefined,
): NormalizedOutput["preferSpace"] => {
  if (prefer === "oklch") {
    return "oklch";
  }

  return preferredValue ? prefer : "oklch";
};

/**
 * Serialize raw OKLCH channels into CSS-ready strings for the requested spaces.
 *
 * @param color - OKLCH channels resolved by the core resolver.
 * @param output - Serialization options for precision, gamut mapping, and output spaces.
 * @param meta - Optional metadata to include when `includeMeta` is enabled.
 */
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
  const srgbInGamut = needsSrgb ? isInGamut(color, "srgb") : false;
  const srgbColor = needsSrgb
    ? mapToGamut(color, "srgb", normalized.gamutMapping, normalized.strict)
    : undefined;
  const srgbRgb = srgbColor ? toGamutRgb(srgbColor, "srgb") : null;
  const srgbAlpha = resolveAlpha(alpha, srgbColor);
  const srgbText = srgbRgb ? formatSrgb(srgbRgb, srgbAlpha, normalized) : undefined;
  const srgbClipped = needsSrgb && normalized.gamutMapping === "clip" && !srgbInGamut;
  const srgbCompressed =
    needsSrgb && normalized.gamutMapping !== "clip" && !srgbInGamut ? true : undefined;

  const needsP3 = spaces.has("p3") || normalized.preferSpace === "p3";
  const p3InGamut = needsP3 ? isInGamut(color, "p3") : false;
  const p3Color = needsP3
    ? normalized.gamutMapping === "preferP3ThenCompress" && p3InGamut
      ? color
      : mapToGamut(color, "p3", normalized.gamutMapping, normalized.strict)
    : undefined;
  const p3Rgb = p3Color ? toGamutRgb(p3Color, "p3") : null;
  const p3Alpha = resolveAlpha(alpha, p3Color);
  const p3Text = p3Rgb ? formatDisplayP3(p3Rgb, p3Alpha, normalized.precision) : undefined;
  const p3Clipped = needsP3 && normalized.gamutMapping === "clip" && !p3InGamut;
  const p3Compressed =
    needsP3 && normalized.gamutMapping !== "clip" && !p3InGamut ? true : undefined;

  const preferredValue =
    normalized.preferSpace === "srgb"
      ? srgbText
      : normalized.preferSpace === "p3"
        ? p3Text
        : oklchText;

  const value = (() => {
    if (normalized.preferSpace === "srgb") {
      return requirePreferredSpace("srgb", normalized.strict, srgbText, oklchText);
    }
    if (normalized.preferSpace === "p3") {
      return requirePreferredSpace("p3", normalized.strict, p3Text, oklchText);
    }
    return oklchText;
  })();

  const spaceUsed = resolveUsedSpace(normalized.preferSpace, preferredValue);
  const diagnostics = (() => {
    if (spaceUsed === "srgb") {
      return buildDiagnostics(spaceUsed, srgbClipped, srgbCompressed);
    }
    if (spaceUsed === "p3") {
      return buildDiagnostics(spaceUsed, p3Clipped, p3Compressed);
    }
    return buildDiagnostics(spaceUsed);
  })();

  return {
    value,
    srgb: spaces.has("srgb") ? srgbText : undefined,
    p3: spaces.has("p3") ? p3Text : undefined,
    oklch: spaces.has("oklch") ? oklchText : undefined,
    alpha,
    meta: buildMeta(meta, normalized, diagnostics),
  };
};

/**
 * Serialize a resolver output while preserving resolver metadata.
 *
 * @param color - Result of the core resolver.
 * @param output - Serialization options for precision, gamut mapping, and output spaces.
 */
export const serializeResolved = (
  color: BaseResolvedColor,
  output?: OutputOptions,
): ResolvedColor => {
  const meta: ColorMeta = {
    step: color.step,
    variantUsed: color.variantUsed,
    seedUsed: color.seedUsed,
  };

  return serializeColor(color.oklch, output, meta);
};

export const serializeColorJson = (
  color: OkLchColor,
  output?: OutputOptions,
  meta?: ColorMeta,
): SerializedColorJson => {
  // JSON export is string-based and mirrors CSS serialization intentionally.
  return serializeColor(color, output, meta);
};
