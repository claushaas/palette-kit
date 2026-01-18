# Usage (React Native)

Palette Kit v0.2 only exposes **OKLCH channel data**. React Native requires **color strings**, so you must serialize yourself.

## 1) Create a theme

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});
```

## 2) Resolve a color

```ts
const text = theme.onSolid({
  bgRole: "action.primary",
  usage: "text",
  context: "light",
});
```

## 3) Serialize for RN

React Native does not accept OKLCH channel objects. Use a serializer appropriate for your environment.

Minimal OKLCH serializer (if you have a runtime that supports `oklch()` strings):

- [docs/snippets/serialize-oklch.md](./snippets/serialize-oklch.md)

```ts
// Assumes `toOklch` from the snippet above.
const rnColor = toOklch(text.oklch);
```

If you need hex/`rgba()` strings, use an OKLCH → sRGB conversion library. v0.2 does not export a converter.
