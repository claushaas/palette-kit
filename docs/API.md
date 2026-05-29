# API

This document describes the public API exposed by the package root in the v0.4
branch.

## Public Entry Point

```ts
import { createPaletteKit } from "@clhaas/palette-kit";
```

The package root exports `createPaletteKit` and the official resolver preset
configs. Public TypeScript types are also reexported from the package root.

## createPaletteKit

```ts
function createPaletteKit(config: PaletteKitConfig): PaletteKit;
```

`createPaletteKit` creates an immutable palette resolver. It normalizes the
intent registry once and keeps context and output defaults explicit.

```ts
const palette = createPaletteKit({
  context: "light",
  output: "oklch",
  preset: "neutral",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});
```

## palette.resolve

```ts
palette.resolve({
  usage,
  intent,
  level,
  on,
  over,
  under,
  state,
  stateDirection,
  context,
  output,
});
```

Resolution always happens in OKLCH first. The selected `output` is applied only
after resolution.

```ts
const surface = palette.resolve({
  usage: "fill",
  intent: "neutral",
  level: 2,
});

const text = palette.resolve({
  usage: "visualVocabulary",
  intent: "brand",
  on: surface,
});
```

## Usage Rules

| Usage | Level | Relations |
| --- | --- | --- |
| `fill` | Required | `on` optional |
| `visualVocabulary` | Forbidden | `on` required |
| `lines` | Required | `on` optional |
| `overlays` | Required | `over` or `under` optional |

`on` enforces APCA contrast. The default target is Lc 60. If the resolver cannot
meet the target after the configured luminance shift and chroma reduction, it
throws.

Relation targets may be any color returned by Palette Kit outputs: `oklch`,
`oklab`, `srgb`, `p3`, `hex`, or `rgba`. Serialized targets are normalized back
to OKLCH internally before contrast or layering logic runs. CSS/RN strings such
as `rgba(...)` are not relation targets.

## State Rules

`state` defaults to `"default"`.

When `state` is not `"default"`, `stateDirection` is required. Palette Kit never
infers whether a state should increase or decrease lightness.

```ts
palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
  state: "hover",
  stateDirection: "increase",
});
```

## Context Rules

Context is never inferred from the system or DOM.

Precedence:

1. Resolver-level `context`
2. Palette-level `context`
3. `systemDefaultContext`

If none is available, resolution throws.

Context affects default level curves. In dark context, the default fill and
lines curves use the inverted structural lightness scale while preserving
intent hue and chroma.

## Output Rules

| Output | Runtime status |
| --- | --- |
| `oklch` | Returns normalized OKLCH object |
| `oklab` | Returns OKLab object |
| `srgb` | Returns `{ r, g, b, alpha }` |
| `p3` | Returns Display-P3 `{ r, g, b, alpha }` |
| `hex` | Serialized to `#rrggbb` |
| `rgba` | Serialized to `{ r, g, b, a }` |

RGB-like outputs use clipped 8-bit channels.

Output precedence:

1. Resolver-level `output`
2. Palette-level `output`
3. `systemDefaultOutput`
4. Explicit `oklch` default

## Public Types

The package root reexports:

- `PaletteKitConfig`
- `PaletteKit`
- `PaletteResolveOptions`
- `PaletteResolveOutput`
- `Usage`
- `Level`
- `State`
- `StateDeltaDirection`
- `Context`
- `ColorOutput`
- `OklchColor`
- `RgbColor`
- `RgbaColor`
- `IntentDefinition`
- `ResolverPresetName`
- `ResolverConfig`
- `ResolverConfigOverrides`
- `RelationParamsConfig`
- `ChromaConfig`

## Not Public in v0.4

- Intent registry helpers
- Validators
- Internal resolver helpers
- Serializer functions
- CLI
- Subpath exporters
