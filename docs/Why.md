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
- `hex` and `rgba` are supported delivery formats.
- CLI and exporters are not public.

## Trade-Off

The current v0.4 branch favors a small, auditable API over a broad convenience
surface. Helpers, presets, exporters, and advanced output handling can be added
later without changing the resolver model.
