# Text and Visual Vocabulary

Text, icons, and similar foreground elements use:

```ts
usage: "visualVocabulary"
```

## Rules

`visualVocabulary`:

- requires `on`;
- forbids `level`;
- resolves from the selected intent and relation target.

```ts
const surface = palette.resolve({
  usage: "fill",
  intent: "neutral",
  level: 2,
});

const text = palette.resolve({
  usage: "visualVocabulary",
  intent: "brand",
  on: surface,
});
```

## Current Behavior

`on` enforces APCA contrast. The default target is Lc 60. APCA is the primary
metric; WCAG contrast is available as a fallback diagnostic when APCA does not
produce a usable numeric value.

The resolver first adjusts OKLCH lightness while preserving hue. If luminance
alone is insufficient, it may reduce chroma within the configured limits. If the
target still cannot be reached, resolution throws.

The contrast solver never changes alpha for `visualVocabulary`.
