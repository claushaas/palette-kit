# API

This document describes the public API exposed by the package root in the v0.4
branch.

## Public Entry Point

```ts
import { createPaletteKit } from "@clhaas/palette-kit";
```

Only `createPaletteKit` is exported as runtime API. Public TypeScript types are
also reexported from the package root.

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

## Output Rules

| Output | Runtime status |
| --- | --- |
| `oklch` | Returns normalized OKLCH object |
| `hex` | Serialized to `#rrggbb` |
| `rgba` | Serialized to `{ r, g, b, a }` |
| `oklab` | Typed, not serialized in v0.4 yet |
| `srgb` | Typed, not serialized in v0.4 yet |
| `p3` | Typed, not serialized in v0.4 yet |

Unsupported serialized outputs throw an explicit Palette Kit error.

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
- `RgbaColor`
- `IntentDefinition`

## Not Public in v0.4

- Intent registry helpers
- Validators
- Internal resolver helpers
- Serializer functions
- Preset configs
- CLI
- Subpath exporters
