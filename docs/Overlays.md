# Overlays

`overlays` is a public usage value in v0.4.

```ts
const scrim = palette.resolve({
  usage: "overlays",
  intent: "neutral",
  level: 1,
  under: surface,
});
```

## Rules

- `level` is required.
- `on` is forbidden.
- `over` and `under` are optional relation targets.

## Current Behavior

The current v0.4 resolver keeps overlay behavior structural:

- base lightness is `50`;
- alpha remains `1`;
- relation hooks validate structure but do not apply visual depth yet.

This is intentional for the current implementation stage.
