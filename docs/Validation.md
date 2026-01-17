# Validation & Errors

This document lists **observable runtime errors** in v0.2 based on the code. It focuses on public entrypoints (`createTheme` → `theme.resolve` / `theme.onSolid`). Internal exporter errors are called out explicitly.

## Input validation (public)

### Color roles and usage

- `role` is required for `theme.resolve` and must be non-empty.
- `usage` is required for `theme.onSolid` (`text` or `icon`).
- For `theme.resolve`, if `usage` is omitted:
  - it is inferred from the role prefix when possible
  - **if `output.strict` is true and usage can’t be inferred**, an error is thrown

### Variants

- `variant` must be a known variant (`neutral`, `accent`, `success`, etc.) or a string matching `category:*` / `chart:*`.
- Invalid variants throw an error in normalization.

### Background hints

- `on: { kind: "color", value: "#hex" }` requires a non-empty value.
- If `output.strict` is true and the color is not a valid hex, an error is thrown.
- If `output.strict` is false, invalid hex values log a warning and are accepted as-is.

### Contrast requirements

- APCA targets (`targetLc`, `minLc`, `maxLc`) must be numbers and must be internally consistent.
- WCAG2 contrast requires `minRatio` (or legacy `ratio`).
- Unknown contrast model values throw.

### Alpha strategy

- `alpha.mode: "fixed"` requires `alpha` to be a number between 0 and 1.
- `alpha.mode` must be one of `none | fixed | solveOnBackground`.

### Output options

- `output.strict` and `output.includeMeta` must be booleans.

## onSolid-specific constraints (public)

- `onSolid` does **not** support `alpha.mode: "solveOnBackground"`.
  - If `output.strict` is true, it throws.
  - If `output.strict` is false, it warns and falls back to a fixed alpha.
- If the contrast solver cannot reach the requested target and `output.strict` is true, it throws:
  - `Contrast solver failed (...)`
- `onSolid` can also throw if a required background is missing in the solver.

## parseColor errors (public, via theme seeds)

Seed colors are parsed by `parseColor` when creating a theme. The following inputs throw:

- Invalid hex formats (length or characters)
- OKLCH inputs with invalid chroma values
- Any input that cannot be converted to RGB/OKLCH

## Internal exporter errors (not public API)

If you use internal exporters/serializers from `src/export/`, you may see:

- `Unable to serialize preferred space: srgb|p3` when `output.strict` is true and conversion fails
- `Unable to convert color to <target>` or `Unable to clamp chroma for <target>` from gamut mapping

These are internal-only in v0.2 and not part of the public entrypoint.
