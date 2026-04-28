# Validation

This document lists observable validation behavior in the current v0.4 branch.

## Intent Registry

Intent names must be flat strings:

- not empty
- no whitespace
- no `.`

Intent values must include finite numeric `hue` and `chroma`. Chroma must be
greater than or equal to `0`.

Unknown intents throw:

```text
Unknown intent "<name>". Did you forget to register it in the Intent Registry?
```

## Usage

Valid usages:

- `fill`
- `visualVocabulary`
- `lines`
- `overlays`

Unknown usages throw a message listing the valid usages.

## Level

Valid levels are integers from `1` to `9`.

Level rules:

- `fill`, `lines`, and `overlays` require `level`.
- `visualVocabulary` forbids `level`.

## Relations

Only one relation may be provided per resolve call.

Relation rules:

- `visualVocabulary` requires `on`.
- `overlays` forbids `on`.
- `fill` and `lines` allow `on`.

Relation targets must be normalized OKLCH colors.

## State

Valid states:

- `default`
- `hover`
- `active`
- `focus`
- `selected`
- `disabled`

When `state` is not `default`, `stateDirection` is required.

## Context

Valid contexts:

- `light`
- `dark`

If resolver context, palette context, and system default context are all absent,
resolution throws:

```text
Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.
```

## Output

Valid output names:

- `oklch`
- `oklab`
- `srgb`
- `p3`
- `hex`
- `rgba`

Runtime serialization supports all valid output names. RGB-like outputs use
explicit clip gamut handling.
