# Usage (JSON)

Palette Kit v0.2 does not expose a public JSON exporter. If you need token JSON, build it manually from `theme.resolve` or `theme.onSolid`.

## Example: minimal JSON map

Minimal OKLCH serializer:

- [docs/snippets/serialize-oklch.md](./snippets/serialize-oklch.md)

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

// Assumes `toOklch` from the snippet above.
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
