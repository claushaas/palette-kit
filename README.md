# Palette Kit

Palette Kit is a **runtime-first color engine** for generating OKLCH-based palettes from semantic queries, with optional build-time tooling (serializer, exporters, CLI, codegen).

## Install

```bash
npm install @clhaas/palette-kit
```

## Runtime quick start

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
  preset: "modern",
});

const bg = theme.resolve({
  role: "bg.app",
  usage: "bg",
  surface: "app",
  context: "light",
});

const onSolidText = theme.onSolid({
  bgRole: "bg.app",
  usage: "text",
  context: "light",
  contrast: { model: "apca", targetLc: 75 },
});
```

## Serializer (public)

Use the serializer to turn resolved OKLCH into CSS/RN-ready strings:

```ts
import { createTheme } from "@clhaas/palette-kit";
import { serializeResolved } from "@clhaas/palette-kit/serialize";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const resolved = theme.resolve({ role: "bg.app", usage: "bg", surface: "app" });
const color = serializeResolved(resolved, { preferSpace: "srgb", srgbFormat: "hex" });

console.log(color.value);
```

## Exporters (public, build-time)

Export deterministic CSS variables and JSON tokens:

```ts
import { createTheme } from "@clhaas/palette-kit";
import { exportThemeCss, exportThemeJson } from "@clhaas/palette-kit/export";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const tokens = {
  "bg.app": { usage: "bg", surface: "app" },
  "text.primary": { usage: "text", surface: "surface" },
};

const { css } = exportThemeCss(theme, tokens, { includeSpaces: ["oklch", "p3"] });
const json = exportThemeJson(theme, tokens, { includeSpaces: ["srgb"] });
```

## CLI

- `palette-kit init` creates `palette.config.ts`
- `palette-kit build` writes `dist/palette/` artifacts (`tokens.css`, `tokens.json`, `tokens.ts`, `tokens.d.ts`)

See `docs/CLI.md` for flags and config details.

## Docs

- `docs/README.md`
- `docs/_api-surface.md`
- `docs/Exporters.md`
- `docs/CLI.md`
- `docs/Migration.md`

## Compatibility

- ESM package (`"type": "module"`).
- CJS is not supported in v0.3; use ESM or dynamic `import()` in CJS environments.
- Subpath imports:
  - `@clhaas/palette-kit/serialize`
  - `@clhaas/palette-kit/export`
  - `@clhaas/palette-kit/cli`
- Tree-shaking: runtime imports (`@clhaas/palette-kit`) do not bundle build-time tools (exporters/CLI).

### CommonJS note

```js
// CJS workaround (dynamic import)
(async () => {
  const { createTheme } = await import("@clhaas/palette-kit");
  const theme = createTheme({
    seeds: {
      light: { neutral: "#111827", accent: "#3d63dd" },
      dark: { neutral: "#111827", accent: "#3d63dd" },
    },
  });
  console.log(theme);
})();
```

## License

MIT — see `LICENSE`.
