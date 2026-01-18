import type { OutputOptions } from "../types/index.js";

const gamutMappings: NonNullable<OutputOptions["gamutMapping"]>[] = [
  "clip",
  "compressChroma",
  "preferP3ThenCompress",
];

const srgbFormats: NonNullable<OutputOptions["srgbFormat"]>[] = ["hex", "rgb", "rgba"];

const formatString = (value: string | undefined) => (value ? value.trim() : undefined);

const assertOneOf = <T extends string>(value: string, options: readonly T[], label: string): T => {
  if (!options.includes(value as T)) {
    throw new Error(`${label} must be one of: ${options.join(", ")} (received "${value}")`);
  }
  return value as T;
};

export type NormalizedOutput = Required<
  Pick<OutputOptions, "preferSpace" | "includeSpaces" | "gamutMapping" | "strict" | "srgbFormat">
> & {
  precision: Required<NonNullable<OutputOptions["precision"]>>;
  includeMeta: boolean;
};

export const normalizeOutput = (output?: OutputOptions): NormalizedOutput => {
  const preferSpaceValue = formatString(output?.preferSpace);
  const gamutMappingValue = formatString(output?.gamutMapping);
  const srgbFormatValue = formatString(output?.srgbFormat);

  const preferSpace = preferSpaceValue
    ? assertOneOf(preferSpaceValue, ["oklch", "srgb", "p3"], "output preferSpace")
    : "oklch";

  const gamutMapping = gamutMappingValue
    ? assertOneOf(gamutMappingValue, gamutMappings, "output gamutMapping")
    : "preferP3ThenCompress";

  const srgbFormat = srgbFormatValue
    ? assertOneOf(srgbFormatValue, srgbFormats, "output srgbFormat")
    : "hex";

  if (output?.strict !== undefined && typeof output.strict !== "boolean") {
    throw new Error("Output strict must be a boolean");
  }

  return {
    preferSpace,
    includeSpaces: output?.includeSpaces ?? [],
    gamutMapping,
    precision: {
      l: 1,
      c: 3,
      h: 1,
      alpha: 2,
      ...output?.precision,
    },
    strict: output?.strict ?? false,
    includeMeta: output?.includeMeta ?? false,
    srgbFormat,
  };
};
