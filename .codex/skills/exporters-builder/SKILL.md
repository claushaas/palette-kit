---
name: exporters-builder
description: Build CSS/JSON exporters per src/planning/spec-v0.3.md and src/planning/roadmap-v0.3.md, including output options and gamut handling.
---

# Exporters Builder

Use this skill when implementing export functions (CSS variables and JSON) and output formatting per v0.3 spec.

## Workflow

1. Read `src/planning/spec-v0.3.md` and the relevant phase in `src/planning/roadmap-v0.3.md`.
2. Implement exporters in `src/export` with `OutputOptions` (precision, formats).
3. Ensure optional `meta` data is included only when requested.
4. Add minimal snapshot-like tests for CSS vars and JSON output.

## Guardrails

- Preserve the public API surface for v0.3 (`exportThemeCss`, `exportThemeJson`).
- Keep output stable and deterministic (ordering, precision).
