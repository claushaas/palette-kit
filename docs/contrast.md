# Contrast

Palette Kit uses APCA (WCAG 3) for contrast-aware adjustments.

## Targets

Default targets (configurable via `createTheme({ contrast })`):

- `textPrimary`: 75
- `textSecondary`: 60

These values represent APCA Lc scores. They are kept for compatibility but are not applied to the text scale tokens (which are deterministic by step).

## On-solid text

Text on solid backgrounds uses the best of white or black (APCA comparison) and applies alpha levels:

- `primary`: 0.92
- `secondary`: 0.72
- `disabled`: 0.48

You can override these in the token layer after creation if needed.
