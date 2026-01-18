import type { OkLchColor } from "../engine/generateScale.js";
import { serializeColorJson } from "../serialize/serializeColor.js";
import type { ColorMeta, ColorQuery, OutputOptions } from "../types/index.js";
import { serializeColor } from "./serializeColor.js";

export type ThemeToken = Omit<ColorQuery, "role" | "output"> & { role?: string };
export type ThemeTokens = Record<string, ThemeToken>;

export type ExportableTheme = {
  resolve: (query: ColorQuery) => { oklch: OkLchColor };
  tokens: ThemeTokens;
};

export type TokenValue = {
  value: string;
  srgb?: string;
  p3?: string;
  oklch?: string;
  alpha: number;
  meta?: ColorMeta;
};

export type ExportMeta = {
  gamutMapping: NonNullable<OutputOptions["gamutMapping"]>;
  preferSpace: NonNullable<OutputOptions["preferSpace"]>;
  includeSpaces: NonNullable<OutputOptions["includeSpaces"]>;
  precision: Required<NonNullable<OutputOptions["precision"]>>;
  strict: boolean;
};

const DEFAULT_OUTPUT = {
  preferSpace: "oklch" as const,
  includeSpaces: [] as NonNullable<OutputOptions["includeSpaces"]>,
  gamutMapping: "preferP3ThenCompress" as const,
  precision: { l: 1, c: 3, h: 1, alpha: 2 },
  strict: false,
  includeMeta: false,
};

const normalizeExportOutput = (output?: OutputOptions) => ({
  preferSpace: output?.preferSpace ?? DEFAULT_OUTPUT.preferSpace,
  includeSpaces: output?.includeSpaces ?? DEFAULT_OUTPUT.includeSpaces,
  gamutMapping: output?.gamutMapping ?? DEFAULT_OUTPUT.gamutMapping,
  precision: {
    ...DEFAULT_OUTPUT.precision,
    ...output?.precision,
  },
  strict: output?.strict ?? DEFAULT_OUTPUT.strict,
  includeMeta: output?.includeMeta ?? DEFAULT_OUTPUT.includeMeta,
});

const buildExportMeta = (output: ReturnType<typeof normalizeExportOutput>): ExportMeta => ({
  gamutMapping: output.gamutMapping,
  preferSpace: output.preferSpace,
  includeSpaces: output.includeSpaces,
  precision: output.precision,
  strict: output.strict,
});

const getTokenEntries = (theme: ExportableTheme) => {
  const tokens = theme.tokens;

  if (!tokens || Object.keys(tokens).length === 0) {
    throw new Error("Theme tokens are required for export");
  }

  return Object.entries(tokens).sort(([a], [b]) => a.localeCompare(b));
};

const getTokenRole = (name: string, token: ThemeToken) => token.role ?? name;

const buildTokenQuery = (name: string, token: ThemeToken): ColorQuery => {
  const { role: _role, ...rest } = token;
  return {
    ...rest,
    role: getTokenRole(name, token),
  };
};

const buildTokenMeta = (name: string, token: ThemeToken): ColorMeta => ({
  role: getTokenRole(name, token),
  ...(token.variant ? { variant: token.variant } : {}),
  ...(token.usage ? { usage: token.usage } : {}),
  ...(token.context ? { context: token.context } : {}),
  ...(token.surface ? { surface: token.surface } : {}),
  ...(token.state ? { state: token.state } : {}),
  ...(token.emphasis ? { emphasis: token.emphasis } : {}),
  ...(token.on ? { on: token.on } : {}),
  ...(token.contrast ? { contrast: token.contrast } : {}),
});

const toCssVarName = (name: string) => name.replace(/\./g, "-");

export const exportThemeCss = (theme: ExportableTheme, output?: OutputOptions) => {
  const normalized = normalizeExportOutput(output);
  const entries = getTokenEntries(theme);
  const lines: string[] = [];

  for (const [name, token] of entries) {
    const query = buildTokenQuery(name, token);
    const resolved = theme.resolve(query);
    const meta = normalized.includeMeta ? buildTokenMeta(name, token) : undefined;
    const serialized = serializeColor(resolved.oklch, normalized, meta);
    const baseName = toCssVarName(name);

    lines.push(`--pk-${baseName}: ${serialized.value};`);

    if (normalized.includeSpaces.includes("srgb") && serialized.srgb) {
      lines.push(`--pk-${baseName}-srgb: ${serialized.srgb};`);
    }
    if (normalized.includeSpaces.includes("p3") && serialized.p3) {
      lines.push(`--pk-${baseName}-p3: ${serialized.p3};`);
    }
    if (normalized.includeSpaces.includes("oklch") && serialized.oklch) {
      lines.push(`--pk-${baseName}-oklch: ${serialized.oklch};`);
    }
  }

  return {
    css: `${lines.join("\n")}\n`,
    meta: normalized.includeMeta ? buildExportMeta(normalized) : undefined,
  };
};

export const exportThemeJson = (theme: ExportableTheme, output?: OutputOptions) => {
  const normalized = normalizeExportOutput(output);
  const entries = getTokenEntries(theme);
  const tokens: Record<string, TokenValue> = {};

  for (const [name, token] of entries) {
    const query = buildTokenQuery(name, token);
    const resolved = theme.resolve(query);
    const meta = normalized.includeMeta ? buildTokenMeta(name, token) : undefined;
    const serialized = serializeColorJson(resolved.oklch, normalized, meta);

    tokens[name] = {
      value: serialized.value,
      srgb: serialized.srgb,
      p3: serialized.p3,
      oklch: serialized.oklch,
      alpha: serialized.alpha,
      meta: serialized.meta,
    };
  }

  return {
    tokens,
    meta: normalized.includeMeta ? buildExportMeta(normalized) : undefined,
  };
};
