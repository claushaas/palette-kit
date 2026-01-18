# Exporters

Palette Kit v0.3 exposes build-time exporters as a public subpath:

- `@clhaas/palette-kit/export`

The runtime entrypoint (`@clhaas/palette-kit`) remains runtime-first (no exporter reexports) for tree-shaking and predictable bundles.

## APIs

- `exportThemeCss(theme, tokens, output?)`
- `exportThemeJson(theme, tokens, output?)`

Both exporters accept `OutputOptions` (preferSpace/includeSpaces/gamutMapping/strict/precision/includeMeta/srgbFormat) and output deterministic, sorted results.

## Example

```ts
import { createTheme } from "@clhaas/palette-kit";
import { exportThemeCss, exportThemeJson } from "@clhaas/palette-kit/export";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
  preset: "modern",
});

const tokens = {
  "bg.app": { usage: "bg", surface: "app" },
  "text.primary": { usage: "text", surface: "surface" },
};

const { css, meta: cssMeta } = exportThemeCss(theme, tokens, {
  includeSpaces: ["oklch", "p3"],
  srgbFormat: "hex",
  includeMeta: true,
});

const json = exportThemeJson(theme, tokens, {
  includeSpaces: ["srgb"],
  includeMeta: true,
});
```

## Output shape

- CSS uses `:root { ... }` plus progressive `@supports` overrides.
- JSON returns `{ tokens: { light: ..., dark: ... }, meta? }` with deterministic token ordering.
