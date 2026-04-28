# Usage: React Native

React Native needs platform-compatible color values. In v0.4, use
`output: "rgba"` for public runtime output.

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  output: "rgba",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});
```

## Resolve RGBA

```ts
const background = palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
});
```

`background` has this shape:

```ts
type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};
```

Convert it to a React Native string if needed:

```ts
const rnColor = `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`;
```

## Resolver Override

You can override output per call:

```ts
const hex = palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
  output: "hex",
});
```

## Notes

- Palette Kit does not inspect platform color scheme automatically.
- Provide `context` or `systemDefaultContext` explicitly.
- `p3` is typed but not serialized in v0.4 yet.
