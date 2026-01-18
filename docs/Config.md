# Config

This file documents the configuration object accepted by `createTheme`.

## Theme config shape

```ts
import { createTheme } from "@clhaas/palette-kit";

createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
  variants: {
    "category:food": "#ef4444",
  },
  preset: "modern",
});
```

### `seeds` (required)

```ts
{
  light: { neutral: string; accent: string };
  dark: { neutral: string; accent: string };
}
```

Seed values are **hex strings** only (`#RGB`, `#RRGGBB`, or `#RRGGBBAA`). This is enforced by `utils/parseColor`.

### `variants` (optional)

```ts
Record<string, string>
```

If a `SemanticVariant` like `category:*` or `chart:*` is requested and exists in `variants`, it is used as the seed. Otherwise it falls back to `accent`.

### `preset` (optional)

- `"modern"` (default)
- `"radixLike"`

Presets define OKLCH lightness/chroma curves per surface.

## Defaults (from code)

- `preset`: `"modern"`
- `variants`: `{}`
