# Alpha Scale

Alpha scales provide transparent steps for overlays, ghost buttons, and subtle fills.

## Defaults

- Base color: `accent` step 9.
- Background: `#ffffff` (light) and `#111111` (dark).
- Curve: `0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.95`.

## Usage

```ts
import { createTheme } from "@claus/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  alpha: {
    enabled: true,
    background: { light: "#ffffff", dark: "#111111" },
  },
});

const alphaStep = theme.alpha?.light[5];
```
