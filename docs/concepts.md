# Concepts

## Seed

A seed is the starting color (usually the accent). The engine anchors the seed at step 9 and generates the rest of the scale around it.

## Scale

A scale is a 12-step set of colors generated for light and dark modes. Each step has semantic meaning in UI.

## Step

Steps are numbered 1-12 and map to usage:

- 1-2: backgrounds
- 3-5: component backgrounds
- 6-8: borders and focus
- 9-10: solid backgrounds
- 11-12: text

## Role (Token)

A role is a semantic alias for a color, such as `bg.app`, `accent.solid`, or `text.primary`.

## Gamut

Not every OKLCH color fits into sRGB. When a color is out of gamut, Palette Kit compresses chroma until it fits.
