# Palette Kit

Modern palette generator (OKLCH + APCA) with Radix-like steps. The library accepts seeds (initial colors) and produces light/dark scales, semantic tokens, and exporters ready for use.

Status: WIP. The API may change while the MVP is under construction.

## Installation

```bash
npm install @clhaas/palette-kit
```

```bash
yarn add @clhaas/palette-kit
```

```bash
pnpm add @clhaas/palette-kit
```

## What the library provides

- 12-step scale (light/dark) from a seed.
- Semantic tokens for UI (`radix-like-ui` preset).
- Alpha scale for overlays.
- Exporters for TS, JSON, CSS vars, Tailwind, and React Native.
- Auto anchor selection per mode (light/dark), overridable via `anchorStep`.
- Basic contrast and gamut diagnostics.

## Usage example

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
    warning: { source: "seed", value: "#f59e0b" },
    danger: { source: "seed", value: "#ef4444" },
  },
  tokens: { preset: "radix-like-ui" },
  p3: true,
});
```

## Quick start

Generate a theme and export CSS variables:

```ts
import { createTheme, toCssVars } from "@clhaas/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
});

const css = toCssVars(theme, { prefix: "pk" });
```

Use tokens in your app:

```css
:root {
  /* paste the generated CSS vars here */
}

body {
  background: var(--pk-bg-app);
  color: var(--pk-text-primary);
}
```

## Step-by-step (install -> usage -> types)

1) Install:

```bash
npm install @clhaas/palette-kit
```

2) Create a config file (`palette.config.mjs`):

```js
/** @type {import("@clhaas/palette-kit").CreateThemeOptions} */
export default {
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
    warning: { source: "seed", value: "#f59e0b" },
    danger: { source: "seed", value: "#ef4444" },
  },
  tokens: { preset: "radix-like-ui" },
  alpha: { enabled: true },
  p3: true,
};
```

3) Generate a typed theme file (includes token name types):

```bash
npx palette-kit generate --out src/theme.ts
```

4) Export CSS vars (for web apps):

```ts
import { toCssVars } from "@clhaas/palette-kit";
import { theme } from "./theme";

const css = toCssVars(theme, { prefix: "pk" });
// write the string into a .css file or inject it at build time
```

5) Use the generated types:

```ts
import { theme, ThemeTokenMap, ThemeTokenName } from "./theme";

const tokens: ThemeTokenMap = theme.tokens.light;
const tokenName: ThemeTokenName = "bg.app";
```

## React Native + Expo

Use the React Native exporter and `useColorScheme()`:

```ts
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { createTheme, toReactNative } from "@clhaas/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  p3: true,
});

export function usePalette() {
  const scheme = useColorScheme();
  const palette = useMemo(() => toReactNative(theme, { includeP3: true }), []);
  return scheme === "dark" ? palette.dark : palette.light;
}
```

See `examples/expo` for a full example.

Note: React Native does not support `color(display-p3 ...)` strings as drop-in colors. The `p3` field is provided as data for platforms that can handle wide color via native APIs.

## Principles

- Tokens by intent, not by color.
- Fixed steps (1-12) for UI consistency.
- OKLCH generation, contrast resolved with APCA.

## Docs and plans

- `docs/README.md`
- `docs/concepts.md`
- `docs/api.md`
- `docs/tokens.md`
- `docs/contrast.md`
- `docs/alpha.md`
- `docs/text.md`
- `docs/Why.md`
- `docs/spec-implementation.md`
- `docs/plan-tests.md`
- `docs/plan-docs.md`

## Short roadmap

1) Generate scales from seeds (light/dark).
2) Tokens and basic exporters.
3) Contrast and alpha scale.

## License

MIT
