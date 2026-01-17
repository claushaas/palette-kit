# Overlays

Overlays are modeled as `surface: "overlay"` with `usage: "bg"`. The preset curves define overlay lightness/chroma ranges.

## Example

```ts
const scrim = theme.resolve({
  role: "overlay.scrim",
  usage: "bg",
  surface: "overlay",
  context: "dark",
  alpha: { mode: "fixed", alpha: 0.55 },
});
```

The returned value is an OKLCH color with an alpha channel (in `scrim.oklch.alpha`).
