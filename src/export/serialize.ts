import { normalizeOklch, type OklchInput } from "../core/oklch.js";
import { oklabToLinearRgb, oklchToOklab } from "../operators/convert.js";
import type { ColorOutput, RgbaColor } from "./types.js";

export type GamutStrategy = "clip";

export type SerializationOptions = Readonly<{
  gamutStrategy?: GamutStrategy;
}>;

export type ColorSerializer<T> = (color: OklchInput, options?: SerializationOptions) => T;

const DEFAULT_GAMUT_STRATEGY = "clip" satisfies GamutStrategy;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

const toSrgbChannel = (linearChannel: number) => {
  const encoded =
    linearChannel <= 0.0031308 ? 12.92 * linearChannel : 1.055 * linearChannel ** (1 / 2.4) - 0.055;

  return Math.round(clampUnit(encoded) * 255);
};

const toHexChannel = (channel: number) => channel.toString(16).padStart(2, "0");

const resolveGamutStrategy = (options: SerializationOptions | undefined) => {
  const strategy = options?.gamutStrategy ?? DEFAULT_GAMUT_STRATEGY;

  if (strategy !== "clip") {
    throw new Error(`Unsupported gamut strategy "${String(strategy)}". Expected "clip".`);
  }

  return strategy;
};

export const serializeOklchToRgba: ColorSerializer<RgbaColor> = (input, options) => {
  resolveGamutStrategy(options);

  const color = normalizeOklch(input);
  const linearRgb = oklabToLinearRgb(oklchToOklab(color));

  return Object.freeze({
    r: toSrgbChannel(linearRgb.r),
    g: toSrgbChannel(linearRgb.g),
    b: toSrgbChannel(linearRgb.b),
    a: color.alpha,
  });
};

export const serializeOklchToHex: ColorSerializer<string> = (input, options) => {
  const rgba = serializeOklchToRgba(input, options);

  return `#${toHexChannel(rgba.r)}${toHexChannel(rgba.g)}${toHexChannel(rgba.b)}`;
};

export function serializeColor(
  color: OklchInput,
  output: ColorOutput,
  options?: SerializationOptions,
): string | RgbaColor {
  if (output === "hex") {
    return serializeOklchToHex(color, options);
  }

  if (output === "rgba") {
    return serializeOklchToRgba(color, options);
  }

  throw new Error(`Unsupported color output "${output}" in Phase 10 serializer.`);
}
