# Usage (Web)

This guide shows the **public API-only** path for using Palette Kit in web apps.

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
const bg = theme.resolve({
  role: "bg.app",
  usage: "bg",
  surface: "app",
  context: "light",
});
```

`bg.oklch` is an OKLCH channel object:

```ts
// { l: number; c: number; h: number; alpha?: number }
console.log(bg.oklch);
```

## 3) Serialize for CSS

v0.2 does **not** export a serializer. Use a minimal OKLCH serializer:

```ts
const toOklch = (c: { l: number; c: number; h: number; alpha?: number }) => {
  const a = c.alpha ?? 1;
  const alphaPart = a < 1 ? ` / ${a}` : "";
  return `oklch(${c.l}% ${c.c} ${c.h}${alphaPart})`;
};

const cssValue = toOklch(bg.oklch);
```

## 4) Apply as CSS variables

```ts
document.documentElement.style.setProperty("--pk-bg-app", cssValue);
```

### Notes

- v0.2 does **not** provide a public sRGB fallback serializer.
- If you need hex/`rgb()` output, bring your own OKLCH → sRGB converter.
