---
name: exporters-builder
description: Build CSS/JSON exporters per docs/spec.md (phases 8-9), including output options and gamut handling.
---

# Exporters Builder

Use this skill when implementing export functions (CSS variables and JSON) and output formatting per `docs/spec.md`.

## Workflow

1. Read phases 8 and 9 in `docs/spec.md` for export requirements.
2. Implement exporters in `src/export` with `OutputOptions` (precision, formats).
3. Ensure optional `meta` data is included only when requested.
4. Add minimal snapshot-like tests for CSS vars and JSON output.

## Guardrails

- Preserve the public API surface (`theme.export.cssVars()`, `theme.export.json()`).
- Keep output stable and deterministic (ordering, precision).
