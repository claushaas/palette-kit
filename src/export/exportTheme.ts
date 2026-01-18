import type { OkLchColor } from "../engine/generateScale.js";
import { serializeColorJson } from "../serialize/serializeColor.js";
import type { ColorContext, ColorMeta, ColorQuery, OutputOptions } from "../types/index.js";
import { serializeColor } from "./serializeColor.js";

export type ThemeToken = Omit<ColorQuery, "role" | "output"> & { role?: string };
export type ThemeTokens = Record<string, ThemeToken>;

export type ExportableTheme = {
  resolve: (query: ColorQuery) => { oklch: OkLchColor };
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
  srgbFormat: "hex" as const,
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
  srgbFormat: output?.srgbFormat ?? DEFAULT_OUTPUT.srgbFormat,
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

const getTokenEntries = (tokens: ThemeTokens) => {
  if (!tokens || Object.keys(tokens).length === 0) {
    throw new Error("Theme tokens are required for export");
  }

  return Object.entries(tokens).sort(([a], [b]) => a.localeCompare(b));
};

const getTokenRole = (name: string, token: ThemeToken) => token.role ?? name;

const buildTokenQuery = (name: string, token: ThemeToken, context?: ColorContext): ColorQuery => {
  const { role: _role, ...rest } = token;
  return {
    ...rest,
    role: getTokenRole(name, token),
    ...(context ? { context } : {}),
  };
};

const buildTokenMeta = (name: string, token: ThemeToken, context?: ColorContext): ColorMeta => ({
  role: getTokenRole(name, token),
  ...(token.variant ? { variant: token.variant } : {}),
  ...(token.usage ? { usage: token.usage } : {}),
  ...(context ? { context } : token.context ? { context: token.context } : {}),
  ...(token.surface ? { surface: token.surface } : {}),
  ...(token.state ? { state: token.state } : {}),
  ...(token.emphasis ? { emphasis: token.emphasis } : {}),
  ...(token.on ? { on: token.on } : {}),
  ...(token.contrast ? { contrast: token.contrast } : {}),
});

const toCssVarName = (name: string) => name.replace(/\./g, "-");

const indent = (lines: string[], prefix: string) =>
  lines.length === 0 ? "" : lines.map((line) => `${prefix}${line}`).join("\n");

/**
 * Export CSS variables for a token map with progressive fallbacks.
 *
 * - Base output uses sRGB for maximum compatibility.
 * - @supports blocks override the main token value with OKLCH and/or P3 as requested.
 */
export const exportThemeCss = (
  theme: ExportableTheme,
  tokens: ThemeTokens,
  output?: OutputOptions,
) => {
  const normalized = normalizeExportOutput(output);
  const entries = getTokenEntries(tokens);
  const baseDecl: string[] = [];
  const oklchDecl: string[] = [];
  const p3Decl: string[] = [];

  const needsOklch =
    normalized.preferSpace === "oklch" || normalized.includeSpaces.includes("oklch");
  const needsP3 = normalized.preferSpace === "p3" || normalized.includeSpaces.includes("p3");

  for (const [name, token] of entries) {
    const query = buildTokenQuery(name, token);
    const resolved = theme.resolve(query);
    const meta = normalized.includeMeta ? buildTokenMeta(name, token) : undefined;
    const baseName = toCssVarName(name);

    // Base fallback MUST be sRGB (no silent OKLCH fallback).
    const baseSrgb = serializeColor(
      resolved.oklch,
      { ...normalized, preferSpace: "srgb", includeSpaces: [], strict: true },
      meta,
    ).value;

    baseDecl.push(`--pk-${baseName}: ${baseSrgb};`);
    if (normalized.includeSpaces.includes("srgb")) {
      baseDecl.push(`--pk-${baseName}-srgb: ${baseSrgb};`);
    }

    if (needsOklch) {
      const oklchValue = serializeColor(
        resolved.oklch,
        { ...normalized, preferSpace: "oklch", includeSpaces: [] },
        meta,
      ).value;

      if (normalized.preferSpace === "oklch") {
        oklchDecl.push(`--pk-${baseName}: ${oklchValue};`);
      }
      if (normalized.includeSpaces.includes("oklch")) {
        oklchDecl.push(`--pk-${baseName}-oklch: ${oklchValue};`);
      }
    }

    if (needsP3) {
      const p3Text = serializeColor(
        resolved.oklch,
        { ...normalized, preferSpace: "oklch", includeSpaces: ["p3"] },
        meta,
      ).p3;

      if (normalized.preferSpace === "p3") {
        if (!p3Text) {
          if (normalized.strict) {
            throw new Error("Unable to serialize preferred space: p3");
          }
        } else {
          p3Decl.push(`--pk-${baseName}: ${p3Text};`);
        }
      }

      if (normalized.includeSpaces.includes("p3") && p3Text) {
        p3Decl.push(`--pk-${baseName}-p3: ${p3Text};`);
      }
    }
  }

  const blocks: string[] = [];
  blocks.push(`:root {\n${indent(baseDecl, "  ")}\n}\n`);

  if (oklchDecl.length > 0) {
    blocks.push(
      `@supports (color: oklch(0% 0 0)) {\n  :root {\n${indent(oklchDecl, "    ")}\n  }\n}\n`,
    );
  }
  if (p3Decl.length > 0) {
    blocks.push(
      `@supports (color: color(display-p3 1 1 1)) {\n  :root {\n${indent(p3Decl, "    ")}\n  }\n}\n`,
    );
  }

  return {
    css: `${blocks.join("\n").trimEnd()}\n`,
    meta: normalized.includeMeta ? buildExportMeta(normalized) : undefined,
  };
};

/**
 * Export JSON tokens for both light and dark contexts.
 */
export const exportThemeJson = (
  theme: ExportableTheme,
  tokens: ThemeTokens,
  output?: OutputOptions,
) => {
  const normalized = normalizeExportOutput(output);
  const entries = getTokenEntries(tokens);
  const lightTokens: Record<string, TokenValue> = {};
  const darkTokens: Record<string, TokenValue> = {};

  const contexts: ColorContext[] = ["light", "dark"];

  for (const [name, token] of entries) {
    for (const context of contexts) {
      const query = buildTokenQuery(name, token, context);
      const resolved = theme.resolve(query);
      const meta = normalized.includeMeta ? buildTokenMeta(name, token, context) : undefined;
      const serialized = serializeColorJson(resolved.oklch, normalized, meta);

      const entry: TokenValue = {
        value: serialized.value,
        srgb: serialized.srgb,
        p3: serialized.p3,
        oklch: serialized.oklch,
        alpha: serialized.alpha,
        meta: serialized.meta,
      };

      if (context === "light") {
        lightTokens[name] = entry;
      } else {
        darkTokens[name] = entry;
      }
    }
  }

  return {
    tokens: {
      light: lightTokens,
      dark: darkTokens,
    },
    meta: normalized.includeMeta ? buildExportMeta(normalized) : undefined,
  };
};
