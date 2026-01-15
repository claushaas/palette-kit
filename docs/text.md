# Text Colors

Text colors are generated from fixed hex bases and a deterministic luminance scale. They do not depend on the active theme. You choose the text scale based on the background zone and the device color scheme.

## Goals

- Deterministic, reproducible text colors.
- No palette name coupling.
- No alpha in text.
- Same values for the text scales in light and dark themes.

## Bases

Default bases (customizable):

- Dark text base: `#1C1C1E`
- Light text base: `#F5F5F7`

## Scale generation

We vary only OKLCH lightness (L). Hue and chroma stay fixed. The scale has 12 steps.

Parameters:

- `STEPS = 12`
- `DELTA_L = 0.055`
- Clamp dark text L to `<= 0.92`
- Clamp light text L to `>= 0.12`

Dark text scale (for light backgrounds):

- `L(12) = L_base`
- `L(n) = L_base + (12 - n) * DELTA_L`

Light text scale (for dark backgrounds):

- `L(1) = L_base`
- `L(n) = L_base - (n - 1) * DELTA_L`

## Background zones

Classify the background by visual scale:

- Light zone: 1-4
- Mid zone: 5-8
- Dark zone: 9-12

## Recommended steps

Light zone (use dark text scale):

- Primary: 12
- Secondary: 10
- Tertiary: 9
- Disabled: 8

Mid zone (use dark text scale):

- Primary: 12
- Secondary: 11
- Tertiary: not available
- Disabled: not available

Dark zone (use light text scale):

- Primary: 1
- Secondary: 3
- Tertiary: 4
- Disabled: 5

## Device color scheme

When the device is in dark mode, invert the background mapping:

- Light zone uses the light text scale.
- Mid zone uses the light text scale.
- Dark zone uses the dark text scale.

## Overlays for unstable backgrounds

When the background is noisy (image, video, gradient), apply an overlay first (black or white) until the surface clearly falls into the light or dark zone. Then choose text normally. Text never uses alpha.

## Tokens

The library exposes both text scales in every mode:

- `text.dark.1` ... `text.dark.12`
- `text.light.1` ... `text.light.12`

Semantic shortcuts are also available:

- `text.dark.primary|secondary|tertiary|disabled`
- `text.light.primary|secondary|tertiary|disabled`

Zone helpers are provided for background-dependent text:

- `text.onBg.light.primary|secondary|tertiary|disabled`
- `text.onBg.mid.primary|secondary`
- `text.onBg.dark.primary|secondary|tertiary|disabled`

For backwards compatibility, `text.primary|secondary|tertiary|disabled` are mapped to the default app background (`bg.app`).

## Customization

You can override the bases in `createTheme`:

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  text: {
    darkBase: "#1C1C1E",
    lightBase: "#F5F5F7",
  },
});
```
