import type { OklchColor } from "../core/oklch.js";
import type { OklabColor } from "../operators/convert.js";
import { createUnsupportedOutputError } from "../utils/errors/errors.js";

export const OUTPUTS = Object.freeze(["oklch", "oklab", "srgb", "p3", "hex", "rgba"] as const);

export type ColorOutput = (typeof OUTPUTS)[number];

export type RgbColor = Readonly<{
  r: number;
  g: number;
  b: number;
  alpha: number;
}>;

export type RgbaColor = Readonly<{
  r: number;
  g: number;
  b: number;
  a: number;
}>;

export type OutputMap = Readonly<{
  oklch: OklchColor;
  oklab: OklabColor;
  srgb: RgbColor;
  p3: RgbColor;
  hex: string;
  rgba: RgbaColor;
}>;

export type ResolveOutput<O extends ColorOutput> = OutputMap[O];

export type ResolveOptionsWithOutput<O extends ColorOutput> = Readonly<{
  output?: O;
}>;

export type TypedResolver<O extends ColorOutput> = (
  options: ResolveOptionsWithOutput<O>,
) => ResolveOutput<O>;

export type OutputResolutionInput = Readonly<{
  resolverOutput?: unknown;
  paletteOutput?: unknown;
  systemDefaultOutput?: unknown;
}>;

const outputList = OUTPUTS.join(", ");

const formatInvalidOutputError = (value: unknown) =>
  `Invalid output "${String(value)}". Expected one of: ${outputList}.`;

export function isColorOutput(value: unknown): value is ColorOutput {
  return typeof value === "string" && (OUTPUTS as readonly string[]).includes(value);
}

export function assertColorOutput(value: unknown): asserts value is ColorOutput {
  if (!isColorOutput(value)) {
    throw createUnsupportedOutputError(String(value), formatInvalidOutputError(value));
  }
}

export function resolveOutput({
  resolverOutput,
  paletteOutput,
  systemDefaultOutput,
}: OutputResolutionInput): ColorOutput {
  if (resolverOutput !== undefined) {
    assertColorOutput(resolverOutput);
  }

  if (paletteOutput !== undefined) {
    assertColorOutput(paletteOutput);
  }

  if (systemDefaultOutput !== undefined) {
    assertColorOutput(systemDefaultOutput);
  }

  return resolverOutput ?? paletteOutput ?? systemDefaultOutput ?? "oklch";
}
