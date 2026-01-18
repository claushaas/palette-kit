# Migration Guide: v0.2 → v0.3

This guide summarizes the most important API surface and packaging changes when upgrading from v0.2 to v0.3.

## Breaking changes

### Exporters moved to a public subpath

v0.3 exposes exporters via:

```ts
import { exportThemeCss, exportThemeJson } from "@clhaas/palette-kit/export";
```

The runtime entrypoint (`@clhaas/palette-kit`) stays runtime-first and does not reexport exporters.

### Serializer is public via subpath

v0.3 exposes the serializer via:

```ts
import { serializeColor, serializeResolved } from "@clhaas/palette-kit/serialize";
```

### CLI is now functional

v0.3 ships a working CLI:

```bash
palette-kit init
palette-kit build
```

The build command writes deterministic artifacts under `dist/palette/`:

- `tokens.css`
- `tokens.json`
- `tokens.ts`
- `tokens.d.ts`

## Non-breaking additions

- Token registry contracts (`TokenRegistry`, `TokenDefinition`, token-safe query types)
- Codegen outputs for DX (generated `dist/palette/tokens.ts` / `tokens.d.ts`)
- Stronger inference and actionable strict-mode validation

## See also

- API surface: `docs/_api-surface.md`
- Exporters: `docs/Exporters.md`
- CLI: `docs/CLI.md`
