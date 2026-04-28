# Why

Palette Kit exists to make semantic color resolution deterministic without
forcing applications to maintain large sets of precomposed color tokens.

## Design Direction

Instead of names like `brandHoverTextOnDark`, v0.4 separates decisions into
axes:

- intent
- usage
- level
- relation
- state
- context
- output

This keeps meaning separate from presentation and environment.

## Current v0.4 Constraints

- Public runtime API is `createPaletteKit`.
- Resolution is internal OKLCH.
- Context is explicit and never inferred.
- Level is explicit and never inferred.
- Output is applied after resolution.
- `on` enforces APCA contrast explicitly.
- `hex`, `rgba`, `oklab`, `srgb`, and `p3` are supported delivery formats.
- Presets and resolver config are explicit public configuration.
- CLI and exporters are not public.

## Trade-Off

The current v0.4 branch favors an auditable API over broad convenience tooling.
CLI commands, token exporters, and codegen can be added later without changing
the resolver model.
