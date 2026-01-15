# Alpha Scales

Alpha scales are translucent variants of solid colors. They do not define identity. They change how the background is perceived.

If it must be read, do not use alpha. If it must be felt (state, depth, focus), alpha is ideal.

## What alpha means

An alpha color only exists in relation to a background:

```text
result = base_color ⊕ background
```

The RGB is fixed. Only the alpha changes. This makes alpha perfect for transient UI states and depth.

## Alpha types

### Neutral overlays

- Black Alpha (darkens any background)
- White Alpha (lightens any background)

These are covered in `docs/overlays.md` and never change between light and dark modes.

### Chromatic alpha

For every palette color, there is a matching alpha scale:

- `accent` -> `accent alpha`
- `neutral` -> `neutral alpha`
- `success`, `warning`, `danger`, and extras follow the same rule

The hue stays fixed. Only alpha varies across steps.

## Scale (1-12)

The scale represents strength, not lightness:

- 1-2: barely visible (delicate hover)
- 3-4: subtle (standard hover)
- 5-6: clear (focus, selected)
- 7-8: strong (group highlight)
- 9-10: blocking (modal backdrops)
- 11-12: extreme cases

## Usage rules

Allowed:

- Hover / pressed / active
- Focus ring
- Selection
- Skeleton loading
- Media overlays

Not allowed:

- Text
- Permanent content
- Critical labels

## Generation model

Radix uses a perceptual, non-linear curve so each step is visually distinct. We use the same alpha curve:

```text
0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.95
```

## Library behavior

`createTheme` generates alpha scales for every palette slot. Each alpha scale is derived from step 9 of the corresponding solid scale. Alpha values are the same in light and dark modes.

Migration note:

- Alpha access changed from `theme.alpha?.light[step]` to `theme.alpha?.[slot].light[step]`.
- CSS vars changed from `--pk-alpha-<step>` to `--pk-alpha-<slot>-<step>`.

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  alpha: { enabled: true },
});

const accentAlpha = theme.alpha?.accent.light[5];
const neutralAlpha = theme.alpha?.neutral.light[3];
```
