# FAQ

## Does v0.2 return CSS color strings?

No. The public API (`createTheme`) returns OKLCH channel data (`BaseResolvedColor.oklch`). String serialization exists only in internal modules.

## Is there a CLI?

`package.json` declares a `palette-kit` binary, but there is no CLI implementation in the repo v0.2.

## Can I export CSS variables or JSON tokens?

Exporters exist in `src/export/`, but they are not publicly exported by the package. See [Exporters](./Exporters.md) for internal usage.

## What color spaces are supported?

Public types allow `srgb`, `p3`, and `oklch` in `OutputOptions`. `oklab` is not present in v0.2.

## Which preset curves are available?

Two presets are implemented internally:

- `modern` (default)
- `radixLike`

These are selected via `createTheme({ preset: "modern" | "radixLike" })`.
