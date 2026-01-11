# Contrast

Palette Kit uses APCA (WCAG 3) for contrast-aware adjustments.

## Targets

Default targets (configurable via `createTheme({ contrast })`):

- `textPrimary`: 75
- `textSecondary`: 60

These values represent APCA Lc scores. They are meant to be product-friendly defaults, not strict compliance.

## How it works

The solver adjusts **Lightness (L)** in OKLCH to reach the target contrast against `bg.app`. It avoids hue changes and only compresses chroma when needed to keep values inside sRGB.

## On-solid text

Text on solid backgrounds uses the best of white or black (APCA comparison) and applies alpha levels:

- `primary`: 0.92
- `secondary`: 0.72
- `disabled`: 0.48

You can override these in the token layer after creation if needed.
