# Changelog

<!-- markdownlint-disable MD024 -->

## v0.4.0

### Breaking changes

- Replaces the previous experimental `createTheme` API with `createPaletteKit`.
- Publishes only the package root export. CLI commands, token exporters, and
  serializer subpaths are not part of v0.4.
- Resolver options are modeled as explicit axes: `usage`, `intent`, `level`,
  relation, `state`, `context`, and `output`.

### Features

- Public `createPaletteKit` factory and `palette.resolve`.
- Public resolver presets: `soft`, `neutral`, and `strong`.
- Explicit `resolverConfig` overrides for level curves, state deltas, relation
  parameters, and chroma limits.
- APCA contrast enforcement for `on` relations with a default Lc 60 target.
- Functional `over` and `under` overlay relations with configured alpha and
  depth behavior.
- Supported outputs: `oklch`, `oklab`, `srgb`, `p3`, `hex`, and `rgba`.
- Strict public TypeScript option types for invalid usage/level/relation/state
  combinations where possible.

## v0.3.0

### Breaking changes

- ESM-only package (`"type": "module"`), no `require()` support.
- Public API is split into subpath exports:
  - `@clhaas/palette-kit` (runtime)
  - `@clhaas/palette-kit/serialize` (serializer)
  - `@clhaas/palette-kit/export` (exporters)
  - `@clhaas/palette-kit/cli` and bin `palette-kit` (CLI)
- Exporters are not re-exported from the main entrypoint to keep the runtime lean and tree-shakeable.

### Features

- Public serializer (`serializeColor`, `serializeResolved`, `theme.serialize`) with OKLCH/sRGB/P3 output options.
- Public exporters: `exportThemeCss` (progressive `@supports` fallbacks) and `exportThemeJson` (stable `{ light, dark }` structure).
- Declarative Token Registry + official token presets (`minimal-ui`, `radixLike-ui`, `modern-ui`).
- CLI tooling:
  - `palette-kit init` (typed config template)
  - `palette-kit build` (deterministic `dist/palette/` artifacts: CSS/JSON/TS + d.ts)
- Strong inference and DX validation improvements (strict vs non-strict behavior, clearer errors).

### Migration

- See `docs/Migration.md` for upgrade notes and updated import paths.

## v0.2.0

- Public API limited to `createTheme` and public types.
- Resolver returns OKLCH channel data, not CSS strings.
- Internal serializers/exporters exist but are not exported.
- CLI is declared but not implemented in this tag.
