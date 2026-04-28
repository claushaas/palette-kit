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

The current v0.4 resolver applies configured relation behavior:

- base lightness is `50`;
- `over` applies alpha from `relationParams.over.baseAlphaByLevel`;
- `under` applies alpha from `relationParams.under.baseAlphaByLevel`;
- `under` also reduces lightness by
  `relationParams.under.luminanceReduction`;

`over` and `under` do not enforce contrast.
