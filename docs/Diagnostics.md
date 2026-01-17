# Diagnostics

v0.2 does not expose a public diagnostics API. However, some internal serialization paths can attach metadata when `includeMeta` is enabled.

## Available metadata (type only)

`ColorMeta` includes:

- role, variant, usage, context, surface, state, emphasis
- contrast (APCA/WCAG2 requirements)
- gamutMapping
- provenance (string)

## Public API status

- `createTheme` returns `BaseResolvedColor` without `meta`.
- Internal serializers (`serializeColor`) can attach `meta` when called directly.

If diagnostics are required in the public API, the entrypoint exports would need to change in a future version.
