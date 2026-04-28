# Palette Kit

Palette Kit v0.4 is a deterministic OKLCH color resolution engine. It resolves
semantic color requests from explicit axes and serializes the result only after
resolution.

## Install

```sh
npm install @clhaas/palette-kit
```

## Quick Start

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  output: "oklch",
  preset: "neutral",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
    neutral: { hue: 0, chroma: 0 },
  },
});

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

## Public Runtime API

The package root exports:

- `createPaletteKit`
- `softResolverConfig`
- `neutralResolverConfig`
- `strongResolverConfig`
- `defaultResolverConfig`

Public TypeScript types are also exported from the package root.

There are no public subpath exports, CLI commands, token exporters, or codegen
APIs in v0.4.

## Resolver Rules

| Usage | Level | Relations |
| --- | --- | --- |
| `fill` | Required | `on` optional |
| `visualVocabulary` | Forbidden | `on` required |
| `lines` | Required | `on` optional |
| `overlays` | Required | `over` or `under` optional |

`state` defaults to `"default"`. Non-default states require explicit
`stateDirection`; Palette Kit never infers whether state should increase or
decrease lightness.

Context is explicit. Provide palette-level `context`, resolver-level `context`,
or host-injected `systemDefaultContext`.

## Output

Supported outputs:

- `oklch`: normalized OKLCH object
- `oklab`: OKLab object
- `srgb`: `{ r, g, b, alpha }`
- `p3`: Display-P3 `{ r, g, b, alpha }`
- `hex`: `#rrggbb`
- `rgba`: `{ r, g, b, a }`

RGB-like outputs use clipped 8-bit channels. Output never changes semantic
resolution.

## Configuration

`createPaletteKit` accepts `preset` and explicit `resolverConfig` overrides.

```ts
const palette = createPaletteKit({
  context: "light",
  preset: "soft",
  intents,
  resolverConfig: {
    relationParams: {
      on: { contrastTarget: 75 },
    },
  },
});
```

The default preset is `neutral`.

## Documentation

- [Docs index](docs/README.md)
- [API](docs/API.md)
- [Configuration](docs/Config.md)
- [Specification summary](docs/spec.md)
- [Migration](docs/Migration.md)

## Module Format

Palette Kit is ESM-only.
