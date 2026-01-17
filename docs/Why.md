# Why Palette Kit

Palette Kit exists to make semantic color systems deterministic and repeatable, without locking consumers into static hex values.

## Problems it addresses (from code behavior)

- **Semantic resolution**: The engine accepts semantic queries (role/usage/context/surface/state) and maps them to OKLCH colors.
- **Deterministic scales**: It generates 12-step OKLCH scales from seed colors using preset curves.
- **Contrast-aware `onSolid`**: It computes text/icon colors for solid backgrounds with APCA/WCAG2 checks.
- **Light/Dark parity**: It uses separate light/dark seed sets and normalizes queries per context.

## Alternatives and trade-offs

- **Static tokens**: simple to ship, but hard to scale across surfaces/states. Palette Kit chooses generated scales.
- **Manual contrast fixes**: error-prone and inconsistent. Palette Kit uses an automated solver for `onSolid`.
- **Wide-gamut output**: internal serializers support P3/OKLCH strings, but v0.2 does not export them publicly. This is a deliberate limitation of the current API surface.

## Explicit constraints in v0.2

- Only `createTheme` and type exports are part of the public package API.
- Exporters/serializers exist in source but are **not exported** through `package.json`.
- CLI is declared in `package.json` but not implemented in the repo.
