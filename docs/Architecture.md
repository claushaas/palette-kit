# Architecture

This document reflects the **actual modules and flow in v0.2**.

## Pipeline overview

1. **Input** — `createTheme` is called with `ThemeConfig` seeds and optional variants/preset.
2. **Parsing** — `utils/parseColor` converts hex to OKLCH + sRGB channels.
3. **Scale generation** — `engine/generateScale` creates 12-step scales per surface using preset curves.
4. **Resolution** — `engine/resolveBaseColor` maps `ColorQuery` (role/usage/context/surface/state) to a base OKLCH step.
5. **Operators** — `operators/emphasis` and `operators/state` adjust the base OKLCH.
6. **onSolid** — `engine/onSolid` solves text/icon colors on solid backgrounds using APCA by default; WCAG2 is optional via `contrast`.
7. **(Internal) Serialization** — `export/serializeColor` formats OKLCH/P3/sRGB strings (not exported in v0.2).

## Key design decisions (from code)

- **Deterministic curves**: Curves are defined per surface in `presets/curves.ts` with fixed L/C ranges.
- **Usage-driven steps**: `resolveStep` maps `usage + surface` to a step index (1–12), clamped.
- **Variant fallback**: If a role does not specify a variant, it is inferred from the role prefix (e.g. `action.*` → accent).
- **onSolid defaults**: If no alpha is specified, text uses `0.92` and icons use `0.72`.
- **Strict mode**: Normalization and solver respect `output.strict` and may throw on invalid inputs.

## Modules (high level)

- `core/` — public theme creation
- `engine/` — resolution and normalization
- `operators/` — state/emphasis transforms
- `contrast/` — APCA/WCAG2 solver and utilities
- `presets/` — curve presets (`modern`, `radixLike`)
- `export/` — serializers/exporters (internal in v0.2)
- `utils/` — math and parsing utilities
