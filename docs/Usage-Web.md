# Usage: Web

Use `createPaletteKit` from the package root.

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});
```

## Resolve OKLCH

```ts
const surface = palette.resolve({
  usage: "fill",
  intent: "neutral",
  level: 2,
});
```

The default output is a normalized OKLCH object.

```ts
surface.space; // "oklch"
surface.l; // number in 0..100
surface.c; // number >= 0
surface.h; // number in [0, 360)
surface.alpha; // number in 0..1
```

## Resolve Hex

```ts
const background = palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
  output: "hex",
});

document.documentElement.style.setProperty("--brand-bg", background);
```

## Resolve Related Text

```ts
const text = palette.resolve({
  usage: "visualVocabulary",
  intent: "brand",
  on: surface,
});
```

`visualVocabulary` requires `on` and forbids `level`.

## Notes

- `fill`, `lines`, and `overlays` require `level`.
- `state !== "default"` requires `stateDirection`.
- `hex`, `rgba`, `srgb`, and `p3` are available for platform delivery.
