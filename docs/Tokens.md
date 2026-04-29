# Tokens

Palette Kit v0.4 does not expose a public token registry or token exporter.

The current model resolves colors from axes. Applications may store the resolved
values as tokens if they need build artifacts.

```ts
const tokens = {
  "surface.default": palette.resolve({
    usage: "fill",
    intent: "neutral",
    level: 2,
    output: "hex",
  }),
};
```

## Important Constraint

Palette Kit rejects intent names that encode usage, state, relation, level, or
visual implementation details. Keep those dimensions in resolver options.

Prefer:

```ts
palette.resolve({
  usage: "fill",
  intent: "brand",
  level: 4,
  state: "hover",
  stateDirection: "increase",
});
```

Avoid designing intent names such as:

```text
brandFillHoverOnDark
dangerStrong
successText
```
