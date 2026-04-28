# Architecture

This document reflects the current v0.4 branch implementation.

## Public Flow

```text
createPaletteKit(config) -> palette.resolve(options) -> output
```

Resolution is deterministic and side-effect free.

## Main Layers

- `core`: OKLCH model and intent registry.
- `engine`: usage, level, state, relation, context, and resolver pipeline.
- `export`: output typing and current `hex` / `rgba` serializers.
- `presets`: internal resolver presets, not public API.
- `types`: public type contracts reexported by the package root.
- `utils`: structured internal errors.

## Resolver Pipeline

The internal resolver:

1. validates usage, state, context, level, and relations;
2. looks up the registered intent;
3. selects the usage strategy;
4. applies level for level-driven usages;
5. applies relation validation and hooks;
6. applies explicit state deltas;
7. applies structural context hooks;
8. returns normalized OKLCH.

Output serialization happens after resolution.

## Public Outputs

- `oklch`: normalized OKLCH object.
- `oklab`: OKLab object.
- `srgb`: clipped 8-bit sRGB object.
- `p3`: clipped 8-bit Display-P3 object.
- `hex`: serialized sRGB hex string.
- `rgba`: serialized sRGB object.

## Not Public in v0.4

- CLI
- subpath exporters
- preset selection
- resolver config overrides
- serializer functions
- registry helpers

See also:

- [Resolver Pipeline Diagram](../planning/v0.4/diagrams/resolver-pipeline.md)
- [Axes Diagram](../planning/v0.4/diagrams/axes.md)
