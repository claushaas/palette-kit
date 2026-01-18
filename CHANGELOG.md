# Changelog

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
