# Palette Kit v0.4 Current Implementation Spec

This document summarizes the current v0.4 branch implementation. The complete
planning specification lives in
[planning/v0.4/v0.4-palette-kit-spec.md](../planning/v0.4/v0.4-palette-kit-spec.md).

## Public Scope

The package root exposes:

- `createPaletteKit`
- public TypeScript types

The package root does not expose CLI commands, subpath exporters, preset configs,
serializer functions, validators, or internal resolver helpers.

## Public Configuration

```ts
createPaletteKit({
  context: "light",
  output: "oklch",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});
```

The public config supports:

- `intents`
- `context`
- `systemDefaultContext`
- `output`

## Resolver Axes

`palette.resolve` accepts:

- `usage`
- `intent`
- `level`
- `on`
- `over`
- `under`
- `state`
- `stateDirection`
- `context`
- `output`

The resolver is deterministic and resolves internally in OKLCH.

## Implemented Outputs

- `oklch`
- `hex`
- `rgba`

`oklab`, `srgb`, and `p3` are part of the type contract but are not serialized in
the current v0.4 implementation.

## Implemented Guarantees

- Same input produces the same output.
- Output format does not change internal OKLCH resolution.
- Context is explicit and never inferred.
- Level is explicit and never inferred.
- Non-default state requires `stateDirection`.
- Forbidden axis combinations throw.

## Current Limitations

- Presets are internal only.
- `resolverConfig` is internal only.
- Contrast enforcement is not implemented as public behavior yet.
- Display-P3 serialization is not implemented yet.
- CLI and exporters are not public in v0.4.

## References

- [Resolver Reference](../planning/v0.4/v0.4-resolver-reference.md)
- [Output Serialization Contract](../planning/v0.4/v0.4-output-serialization-contract.md)
- [Testing Strategy](../planning/v0.4/v0.4-testing-strategy-golden-cases.md)
