# Tokens

v0.2 does not expose a public token registry or token export API. Instead, **roles are plain strings** and are interpreted by the resolver.

## Role naming conventions (from resolver)

`engine/resolveBaseColor.ts` infers variants from role prefixes:

- `action.*` → `accent`
- `bg.*`, `surface.*`, `border.*`, `text.*` → `neutral`

Examples of roles used in tests and docs:

- `bg.app`
- `surface.card`
- `text.primary`
- `action.primary`
- `focus.ring`
- `overlay.scrim`

## Usage + surface drive step selection

`usage` and `surface` together decide which scale step is chosen. This is the main driver of the resulting OKLCH.

## Exported tokens (internal)

There is an **internal** exporter module in `src/export/exportTheme.ts`, but it is **not exported** through `package.json` in v0.2. See [Exporters](./Exporters.md) for details.
