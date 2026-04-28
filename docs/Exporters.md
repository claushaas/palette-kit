# Exporters

Palette Kit v0.4 does not expose public CSS or JSON exporters.

There is no public exporter subpath.

## Current Public Path

Build exported artifacts manually from `palette.resolve`.

```ts
const tokens = {
  "brand.surface": palette.resolve({
    usage: "fill",
    intent: "brand",
    level: 4,
    output: "hex",
  }),
};
```

## Supported Runtime Outputs

- `oklch`
- `hex`
- `rgba`

`oklab`, `srgb`, and `p3` are typed but not serialized yet.

## Future Work

Public exporters may be added after the minimal v0.4 resolver surface is stable.
