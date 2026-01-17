# Exporters

## Status in v0.2

Exporter and serializer modules exist in `src/export/`, but **they are not part of the public package export** (`package.json` only exports `"."`).

If you are working inside this repository or building from source, you can import them directly from source paths.

## Internal modules

- `exportThemeCss` / `exportThemeJson` — `src/export/exportTheme.ts`
- `serializeColor` / `serializeColorJson` — `src/export/serializeColor.ts`

These return **string-based color values** (hex / `oklch()` / `color(display-p3 ...)`).

## Example (internal usage)

```ts
import { createTheme } from "../src/core/createTheme.js";
import { exportThemeCss, exportThemeJson } from "../src/export/exportTheme.js";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const exportable = {
  resolve: theme.resolve.bind(theme),
  tokens: {
    "bg.app": { usage: "bg", context: "light", surface: "app" },
    "text.primary": { usage: "text", context: "light", surface: "surface" },
  },
};

const css = exportThemeCss(exportable, { preferSpace: "oklch" });
const json = exportThemeJson(exportable, { preferSpace: "oklch" });
```

## OutputOptions

Both exporters accept `OutputOptions` (preferSpace/includeSpaces/gamutMapping/strict/precision/includeMeta). The exporters are deterministic and output tokens sorted by key.

## React Native / Expo (internal usage)

There is **no public RN adapter** in v0.2. If you are working inside the repo, you can serialize to strings and pass them directly to RN styles:

```ts
import { createTheme } from "../src/core/createTheme.js";
import { serializeColor } from "../src/export/serializeColor.js";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const color = serializeColor(
  theme.resolve({ role: "text.primary", usage: "text", context: "light", surface: "surface" })
    .oklch,
  { preferSpace: "oklch" },
);

// Use `color.value` in RN styles.
```

## Tailwind (internal usage)

There is **no Tailwind integration** in v0.2. If you need one, you can generate CSS variables or a JSON map using the internal exporter and feed it into your Tailwind config.

## Public API note

If you need exporters as part of the published package, the `exports` map must be extended. In v0.2 they remain internal only.
