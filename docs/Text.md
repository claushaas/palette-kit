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

Contrast enforcement is not implemented as public behavior in the current v0.4
branch. The resolver validates the relation and returns deterministic OKLCH.
