# FAQ

## What is the public API in v0.4?

The public runtime API is `createPaletteKit` from the package root.

```ts
import { createPaletteKit } from "@clhaas/palette-kit";
```

The palette instance exposes `palette.resolve`.

## Does Palette Kit return CSS strings?

It depends on `output`.

- `output: "oklch"` returns a normalized OKLCH object.
- `output: "hex"` returns a `#rrggbb` string.
- `output: "rgba"` returns `{ r, g, b, a }`.

## Are `oklab`, `srgb`, and `p3` supported?

Yes. `oklab` returns an OKLab object. `srgb` and `p3` return RGB-like objects
with `{ r, g, b, alpha }`.

## Is there a CLI?

No. There is no public CLI in the v0.4 branch.

## Can I export CSS variables or JSON tokens?

There is no public exporter subpath in v0.4. Build CSS, JSON, or token files
manually from `palette.resolve`.

## Are presets public?

Yes. `soft`, `neutral`, and `strong` are public resolver presets. The package
root also exports the preset config objects.

`createPaletteKit` accepts `preset` and explicit `resolverConfig` overrides.

## Does `on` enforce contrast?

Yes. `on` enforces APCA contrast with a default Lc 60 target and fails
explicitly if the target cannot be satisfied.

## Does Palette Kit detect dark mode?

No. Context is explicit. Provide `context`, resolver-level `context`, or
`systemDefaultContext`.
