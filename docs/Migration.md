# Migration Notes for the v0.4 Branch

The v0.4 branch is a rebuild around `createPaletteKit` and orthogonal resolver
axes. It is not a continuation of the older theme factory API.

## Removed From the Public Surface

- legacy theme factory
- public exporter subpaths
- public serializer subpaths
- CLI commands
- seed-based theme config
- older public presets

## Current Public Surface

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

## Conceptual Migration

Older versions organized resolution around seeds, roles, surfaces, and theme
helpers. The v0.4 branch organizes resolution around explicit axes:

- `intent`
- `usage`
- `level`
- `relation`
- `state`
- `context`
- `output`

## Output Migration

Use resolver output directly:

```ts
const color = palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
  output: "hex",
});
```

There is no public token exporter or CLI in the current v0.4 branch.

## References

- [API](./API.md)
- [Configuration](./Config.md)
- [v0.4 SPEC](../planning/v0.4/v0.4-palette-kit-spec.md)
