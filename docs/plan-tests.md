# Test Plan

## Goals

- Guarantee deterministic output for `generateScale` and `createTheme`.
- Keep regressions visible (snapshots + explicit expectations).
- Validate contrast targets and gamut constraints.
- Provide fast feedback for contributors.

## Proposed stack

- Test runner: Vitest (ESM friendly, fast).
- Assertions: built-in Vitest expect.
- Snapshots: file snapshots for scales and tokens.

## Test suites

### Unit - Engine

- OKLCH conversion and hex formatting.
- Curves application per step range.
- Template selection by hue (warm/cool/neutral).
- Gamut mapping: no out-of-gamut output (sRGB).

### Unit - Contrast solver

- APCA target ranges for `text.primary`, `text.secondary`, `onSolid.textPrimary`.
- Fallback to WCAG2 when APCA not available.
- Tolerance thresholds documented.

### Unit - Alpha scale

- Curve values match default alpha steps (0.05..0.95).
- Output uses `#RRGGBBAA` format.

### Integration - Theme composition

- `createTheme` returns tokens for light/dark.
- Token map uses expected source steps.
- Overrides applied correctly.

### Exporters

- `toJson` shape and determinism.
- `toCssVars` naming convention (`--<prefix>-bg-app` etc).

## Fixtures

- Golden seeds: pink, blue, yellow, green (diverse hues).
- Edge seeds: low chroma (near gray), very dark, very light.
- Radix seeds: a small representative subset for sanity checks.

## CI plan (later)

- Run tests on Node 22.
- Add snapshot update workflow for maintainers.

## Open points

- Confirm Vitest vs Jest.
- Snapshot format (JSON vs Markdown).
