# API Reference

## generateScale

Generate a single 12-step scale (light/dark) from a seed.

```ts
import { generateScale } from "@claus/palette-kit";

const scale = generateScale({
  source: { source: "seed", value: "#3d63dd" },
  mode: "both",
  template: "auto",
  anchorStep: "auto",
});
```

Options:

- `source`: `{ source: "seed", value: "#RRGGBB" }` or `{ source: "radix", name: "slate" }`.
- `mode`: `"light" | "dark" | "both"` (default: `both`).
- `anchorStep`: step that matches the seed (default: `"auto"`). Accepts a step, `"auto"`, or `{ light, dark }`.
- `autoAnchor`: tune the auto anchor evaluation (candidate steps, contrast targets, lightness bounds).
- `seedNormalize`: clamp seed lightness/chroma before anchoring (useful with `"auto"`).
- `template`: `"auto" | "neutral" | "warm" | "cool"` (default: `auto`).
- `curves`: overrides for lightness/chroma curves.
- `gamut`: `{ strategy: "compress" | "clip" }`.

Returns:

- `Scale` with `light`, `dark`, and `meta.outOfGamutCount` (plus `meta.outOfP3GamutCount` and `meta.anchorSteps`).

## createTheme

Compose a full theme from multiple scales and produce semantic tokens.

```ts
import { createTheme } from "@claus/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
    warning: { source: "seed", value: "#f59e0b" },
    danger: { source: "seed", value: "#ef4444" },
  },
  tokens: { preset: "radix-like-ui" },
  alpha: {
    enabled: true,
    background: { light: "#ffffff", dark: "#111111" },
  },
  contrast: {
    textPrimary: 75,
    textSecondary: 60,
  },
  p3: true,
});
```

Options:

- `scale`: options forwarded to every `generateScale` call (excluding `source`, `mode`, `p3`).

Returns:

- `Theme` with `scales`, `tokens`, `alpha`, and `diagnostics`.

## toCssVars

Export CSS variables for tokens, scales, and alpha.

```ts
import { toCssVars } from "@claus/palette-kit";

const css = toCssVars(theme, {
  prefix: "pk",
  includeTokens: true,
  includeScales: true,
  includeAlpha: true,
  includeP3: true,
  lightSelector: ":root",
  darkSelector: ".dark",
});
```

When `includeP3` is enabled and P3 data is available, the exporter adds a `@supports` block with `color(display-p3 ...)` values.

## toTailwind

Export a Tailwind config object with `colors` for light/dark modes.

```ts
import { toTailwind } from "@claus/palette-kit";

const tailwind = toTailwind(theme, {
  mode: "both",
  includeTokens: true,
  includeScales: false,
  includeAlpha: false,
  includeP3: true,
});
```

## toReactNative

Export a plain JS object for React Native / Expo.

```ts
import { toReactNative } from "@claus/palette-kit";

const palette = toReactNative(theme, {
  includeTokens: true,
  includeScales: true,
  includeAlpha: true,
  includeP3: true,
});
```

Note: React Native does not support `color(display-p3 ...)` strings as drop-in colors. The `p3` field is provided as data for platforms that can handle wide color via native APIs.

## toJson / toTs

```ts
import { toJson, toJsonWithMode, toTs, toTsWithMode } from "@claus/palette-kit";

const json = toJson(theme);
const ts = toTs(theme);

const jsonP3 = toJsonWithMode(theme, "p3");
const tsP3 = toTsWithMode(theme, "p3");
```

## selectThemeColorMode

Switch a theme to use P3 scales when available.

```ts
import { selectThemeColorMode } from "@claus/palette-kit";

const themeP3 = selectThemeColorMode(theme, "p3");
```

## Diagnostics

```ts
import { analyzeScale, analyzeTheme } from "@claus/palette-kit";

const scaleReport = analyzeScale(scale);
const themeReport = analyzeTheme(theme);
```

## On-solid tokens

```ts
import { onSolidTextTokens } from "@claus/palette-kit";

const onSolid = onSolidTextTokens("#3d63dd");
```
