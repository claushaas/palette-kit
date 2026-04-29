# Concepts

Palette Kit v0.4 resolves colors from orthogonal axes instead of precomposed
tokens.

## Intent

An intent is a semantic hue and chroma anchor.

```ts
intents: {
  brand: { hue: 260, chroma: 0.14 },
  neutral: { hue: 0, chroma: 0 },
}
```

Intent does not encode usage, level, state, relation, or context.

## Usage

`usage` describes how the color is used:

- `fill`
- `visualVocabulary`
- `lines`
- `overlays`

## Level

`level` is an explicit integer from `1` to `9`.

It is required for:

- `fill`
- `lines`
- `overlays`

It is forbidden for `visualVocabulary`.

## Relation

Relations connect one resolved color to another:

- `on`
- `over`
- `under`

`visualVocabulary` requires `on`.

## State

`state` defaults to `default`.

When state is not `default`, the caller must provide `stateDirection` as
`increase` or `decrease`.

## Context

Context is `light` or `dark`. It is never inferred automatically.

Precedence:

1. resolver-level context
2. palette-level context
3. system default context

## Output

Output is a delivery concern, not semantic input.

Changing output must not change internal OKLCH resolution.

See [What Never Happens](../planning/v0.4/diagrams/what-never-happens.md).
