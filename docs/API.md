# API

This API reference is derived from the **API Surface Report** (`docs/_api-surface.md`). Only items exported by the package entrypoint are documented here.

## Public entrypoint

```ts
import { createTheme } from "@clhaas/palette-kit";
```

## createTheme

**Source**: `src/core/createTheme.ts`

**Signature**:

```ts
function createTheme(config: {
  seeds: {
    light: { neutral: string; accent: string };
    dark: { neutral: string; accent: string };
  };
  variants?: Record<string, string>;
  preset?: "modern" | "radixLike";
}): {
  resolve(query: ColorQuery): BaseResolvedColor;
  color(role: ColorRole, options?: Omit<ColorQuery, "role">): BaseResolvedColor;
  onSolid(query: OnSolidQuery): BaseResolvedColor;
  withContext(context: ColorContext): ReturnType<typeof createTheme>;
}
```

**Notes (from code)**:

- `preset` defaults to `"modern"`.
- `variants` defaults to `{}`.
- Returned `resolve`/`color`/`onSolid` return **base** OKLCH data, not CSS strings.

**BaseResolvedColor shape** (internal type used in return values):

```ts
{
  oklch: { l: number; c: number; h: number; alpha?: number };
  step: number;
  variantUsed: string;
  seedUsed: string;
}
```

### Example

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const bg = theme.resolve({
  role: "bg.app",
  usage: "bg",
  surface: "app",
  context: "light",
});

console.log(bg.oklch); // { l, c, h, alpha }
```

## Type exports

All types below are exported from `src/types/index.ts` and reexported by the package entrypoint.

- `CssColorString`
- `ColorSpace`
- `ColorContext`
- `SurfaceIntent`
- `ColorState`
- `ColorEmphasis`
- `SemanticVariant`
- `ColorRole`
- `ColorUsage`
- `BackgroundHint`
- `ContrastRequirement`
- `AlphaStrategy`
- `OutputOptions`
- `RawColor`
- `ColorMeta`
- `ResolvedColor`
- `ColorQuery`
- `OnSolidQuery`
- `SemanticColorTheme`

### Type details (selected)

#### ColorSpace

```ts
type ColorSpace = "srgb" | "p3" | "oklch";
```

#### OutputOptions

```ts
interface OutputOptions {
  preferSpace?: ColorSpace;
  includeSpaces?: ColorSpace[];
  gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress";
  strict?: boolean;
  precision?: { l?: number; c?: number; h?: number; alpha?: number };
  includeMeta?: boolean;
}
```

#### ResolvedColor

```ts
interface ResolvedColor {
  value: string;
  srgb?: string;
  p3?: string;
  oklch?: string;
  alpha: number;
  meta?: ColorMeta;
}
```

> Note: `ResolvedColor` represents string-based serialization **only in internal exporters**. `createTheme` currently returns `BaseResolvedColor` objects.
