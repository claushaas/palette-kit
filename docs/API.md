# API

This reference is derived from the **API Surface Report** (`docs/_api-surface.md`). Only items exported by the package entrypoint are documented as public API.

## Public entrypoint

```ts
import { createTheme } from "@clhaas/palette-kit";
```

## createTheme

**Source**: `src/core/createTheme.ts`

### Signature (observed)

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

### Data contract (runtime return shape)

`createTheme` returns a **BaseResolvedColor** object for `resolve`, `color`, and `onSolid`. This shape is not exported, but it is the **actual runtime contract** in v0.2:

```ts
type BaseResolvedColor = {
  oklch: { l: number; c: number; h: number; alpha?: number };
  step: number;
  variantUsed: string;
  seedUsed: string;
};
```

If you need CSS strings, you must serialize `oklch` yourself or use the internal serializers in `src/export/` (not part of the published API).

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

### Selected type details

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

`ResolvedColor` is used by internal serializers. It is not returned by `createTheme` in v0.2.

### Data flow summary

```text
createTheme(...) → theme.resolve(...) → BaseResolvedColor (runtime shape)
createTheme(...) → theme.onSolid(...) → BaseResolvedColor (runtime shape)
```

`ResolvedColor` is a **serialization-only** type in v0.2. It is not part of the public resolver contract.
