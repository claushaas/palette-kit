# Palette Kit — v0.2 Code-Based Spec

This document replaces the previous speculative spec. It reflects **only what exists in the v0.2 codebase**.

For full documentation, see:

- [docs/README.md](./README.md)
- [docs/_api-surface.md](./_api-surface.md)
- [docs/spec-legacy.md](./spec-legacy.md) (archived, speculative v0.1-era spec)

## Scope of v0.2

- Public API: `createTheme` + types from `src/types/index.ts`.
- Theme resolution returns OKLCH channel data (not CSS strings).
- Internal serializers/exporters exist in `src/export/` but are **not exported** from the package entrypoint.
- CLI is declared in `package.json` but has no implementation in the repository.

## Design intent vs current implementation

The original spec covered a broader system (tokens, exporters, CLI). In v0.2:

**Implemented (current)**:

- Resolver engine with `createTheme`, `resolve`, `color`, `onSolid`, `withContext`
- OKLCH step generation (12 steps)
- State and emphasis operators
- APCA/WCAG2-based `onSolid`

**Planned but not implemented in v0.2**:

- Public exporters (CSS/JSON) as part of the package API
- CLI for generating tokens
- Token map output as part of the public API
- Anchor-step/slot pinning

**Why it was cut**:

- The public entrypoint in v0.2 exports only `createTheme` + types.
- Exporters and serializers exist in `src/export/`, but they are not exposed in `package.json` exports.
- CLI is declared but no `src/cli.*` exists in this tag.

## Implementation summary

- Seeds: required `light`/`dark` `neutral` + `accent` hex values.
- Presets: `modern` (default) and `radixLike`.
- Scale generation: 12 steps per surface in OKLCH.
- Resolution: `resolve`/`color` map semantic queries to a scale step, then apply state/emphasis operators.
- `onSolid`: computes text/icon colors with APCA/WCAG2 checks and default alpha.

## See also

- [Architecture](./Architecture.md)
- [API](./API.md)
