# Configuration

`createPaletteKit` accepts a small explicit configuration object.

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  output: "oklch",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});
```

## intents

```ts
Record<string, { hue: number; chroma: number }>
```

`intents` is required. Intent names must be flat strings:

- not empty
- no whitespace
- no `.`

`hue` must be finite and is normalized to `[0, 360)`. `chroma` must be finite
and greater than or equal to `0`.

## context

```ts
"light" | "dark"
```

`context` is optional at palette creation. It becomes the default environment
for resolver calls.

Palette Kit never reads `prefers-color-scheme`, the DOM, or platform state.

## systemDefaultContext

```ts
"light" | "dark"
```

`systemDefaultContext` is an optional host-provided fallback.

Context precedence:

1. Resolver-level `context`
2. Palette-level `context`
3. `systemDefaultContext`

If no context can be resolved, `palette.resolve` throws.

## output

```ts
"oklch" | "oklab" | "srgb" | "p3" | "hex" | "rgba"
```

`output` is optional and defaults to `oklch`.

Runtime support in the current v0.4 implementation:

- `oklch`: supported
- `oklab`: supported
- `srgb`: supported
- `p3`: supported
- `hex`: supported
- `rgba`: supported

## Presets and Resolver Config

`preset` is optional and defaults to `"neutral"`.

```ts
createPaletteKit({
  context: "light",
  preset: "soft",
  intents,
});
```

Public presets:

- `soft`
- `neutral`
- `strong`

`resolverConfig` explicitly overrides the selected preset.

```ts
createPaletteKit({
  context: "light",
  preset: "neutral",
  intents,
  resolverConfig: {
    relationParams: {
      on: { contrastTarget: 75 },
    },
    stateDeltas: {
      luminance: { hover: 4 },
    },
  },
});
```

Supported resolver config sections:

- `levelCurves`
- `stateDeltas`
- `relationParams`
- `chromaLimits`

The default `on` contrast target is APCA Lc 60. `over` and `under` alpha values
are configured per level.
