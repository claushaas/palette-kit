# Palette Kit — v0.2 Code-Based Spec

This document replaces the previous speculative spec. It reflects **only what exists in the v0.2 codebase**.

For full documentation, see:

- [docs/README.md](./README.md)
- [docs/_api-surface.md](./_api-surface.md)

## Scope of v0.2

- Public API: `createTheme` + types from `src/types/index.ts`.
- Theme resolution returns OKLCH channel data (not CSS strings).
- Internal serializers/exporters exist in `src/export/` but are **not exported** from the package entrypoint.
- CLI is declared in `package.json` but has no implementation in the repository.

## Implementation summary

- Seeds: required `light`/`dark` `neutral` + `accent` hex values.
- Presets: `modern` (default) and `radixLike`.
- Scale generation: 12 steps per surface in OKLCH.
- Resolution: `resolve`/`color` map semantic queries to a scale step, then apply state/emphasis operators.
- `onSolid`: computes text/icon colors with APCA/WCAG2 checks and default alpha.

## See also

- [Architecture](./Architecture.md)
- [API](./API.md)
