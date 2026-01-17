# Usage (JSON)

Palette Kit v0.2 does not expose a public JSON exporter. If you need token JSON, build it manually from `theme.resolve` or `theme.onSolid`.

## Example: minimal JSON map

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const toOklch = (c: { l: number; c: number; h: number; alpha?: number }) => {
  const a = c.alpha ?? 1;
  const alphaPart = a < 1 ? ` / ${a}` : "";
  return `oklch(${c.l}% ${c.c} ${c.h}${alphaPart})`;
};

const tokens = {
  "bg.app": toOklch(
    theme.resolve({ role: "bg.app", usage: "bg", surface: "app", context: "light" }).oklch,
  ),
  "text.primary": toOklch(
    theme.resolve({ role: "text.primary", usage: "text", surface: "surface", context: "light" })
      .oklch,
  ),
};

const json = JSON.stringify(tokens, null, 2);
```

If you need multi-space outputs (sRGB/P3), use your own conversion utilities. v0.2 does not expose them publicly.
