# Usage: JSON

Palette Kit v0.4 does not expose a public JSON exporter. Build JSON manually
from `palette.resolve` outputs.

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});

const tokens = {
  "surface.default": palette.resolve({
    usage: "fill",
    intent: "neutral",
    level: 2,
    output: "hex",
  }),
  "brand.default": palette.resolve({
    usage: "fill",
    intent: "brand",
    level: 4,
    output: "hex",
  }),
};

const json = JSON.stringify(tokens, null, 2);
```

## Notes

- There is no public exporter subpath in v0.4.
- `hex` and `rgba` are supported runtime outputs.
- `oklab`, `srgb`, and `p3` are typed but not serialized yet.
