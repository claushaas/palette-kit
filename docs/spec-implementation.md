# Implementation Spec - Palette Kit

## 1) Goal

Generate palettes from seeds using OKLCH + APCA as described in `docs/Why.md`. Radix colors can be used as optional seed sources (from Radix step-9 samples).

## 2) MVP scope (v0.1)

- Generate 12-step scale (light/dark) from a seed.
- Support color sources:
  - `seed` (direct hex).
  - `radix` (scale name) as optional input, using precomputed seeds.
- OKLCH as generation space.
- Simple gamut mapping (compress chroma until sRGB).
- Basic semantic tokens (`radix-like-ui` preset).
- Exporters: TS (object), JSON, CSS vars, Tailwind, React Native.
- Display-P3 output support.
- Diagnostics (contrast score, out-of-gamut count, anchor steps).
- Modern runtime: Node >= 22, TypeScript >= 5.5, ESM.
- Dependencies: `colorjs.io` (OKLCH/conversions) and `apca-w3` (contrast).

## 3) Out of scope (v0.1)

- Visual preview and snapshot tooling.
- Advanced diagnostics (gamut heatmap, detailed reports).

## 4) Types and data (TS)

```ts
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColorHex = `#${string}`; // runtime validation

type RadixSeedName = string; // generated from `radixSeeds`

type TemplateId = "neutral" | "warm" | "cool";

type ColorSource =
  | { source: "seed"; value: ColorHex }
  | { source: "radix"; name: RadixSeedName };

type Scale = {
  light: Record<Step, ColorHex>;
  dark: Record<Step, ColorHex>;
  meta?: ScaleDiagnostics;
};

type AlphaScale = {
  light: Record<Step, ColorHex>; // #RRGGBBAA
  dark: Record<Step, ColorHex>;
};

type Theme = {
  scales: Record<string, Scale>; // neutral, accent, success, etc.
  tokens: {
    light: Record<string, ColorHex>;
    dark: Record<string, ColorHex>;
  };
  alpha?: AlphaScale;
  diagnostics?: ThemeDiagnostics;
};
```

## 5) APIs

```ts
// generate a single scale
function generateScale(options: {
  source: ColorSource;
  mode?: "light" | "dark" | "both";
  anchorStep?: Step | "auto" | { light?: Step | "auto"; dark?: Step | "auto" }; // default auto
  autoAnchor?: AutoAnchorOptions;
  seedNormalize?: SeedNormalizeOptions;
  template?: "auto" | TemplateId;
  curves?: CurveConfig;
  gamut?: { strategy: "compress" | "clip" };
  p3?: boolean;
}): Scale;

// compose a full theme
function createTheme(config: {
  neutral: ColorSource;
  accent: ColorSource;
  semantic?: {
    success?: ColorSource;
    warning?: ColorSource;
    danger?: ColorSource;
  };
  extras?: Record<string, ColorSource>; // category1, chart1, etc
  tokens?: { preset?: "radix-like-ui"; overrides?: TokenOverrides };
  alpha?: { enabled?: boolean; background?: { light?: ColorHex; dark?: ColorHex } };
  contrast?: { textPrimary?: number; textSecondary?: number };
  scale?: Omit<GenerateScaleOptions, "source" | "mode" | "p3">;
  p3?: boolean;
}): Theme;
```

## 6) Engine (scale generation)

Steps (light/dark share logic, different templates):

1. Convert seed to OKLCH.
2. Select internal template (auto by hue or fixed `template`).
3. Anchor seed at `anchorStep` (default auto, or auto per mode):
   - `dL = L_seed - L_template[anchor]`
   - `dC = C_seed - C_template[anchor]`
   - `dH = H_seed - H_template[anchor]`
   - optional: normalize seed L/C before anchoring
4. Apply deltas per step using curves:
   - L: 1-2 (0.25-0.35), 3-5 (0.55-0.70), 6-8 (0.75-0.90), 9-12 (1.0)
   - C: 1-2 (0.15-0.25), 3-5 (0.50-0.70), 6-8 (0.70-0.90), 9-10 (1.0), 11-12 (0.60-0.80)
5. Gamut mapping: convert to sRGB and compress chroma if out of gamut.
6. Convert to hex.

## 7) Templates

- Internal templates (v0.1): `neutral`, `warm`, `cool` as OKLCH curves.
- `auto` chooses template by hue (warm vs cool, neutral for low chroma).

Format:

```ts
const templates = {
  light: { [templateId]: OKLCHStepMap },
  dark: { [templateId]: OKLCHStepMap },
};
```

## 8) Contrast solver (APCA)

- Apply to critical tokens: `text.primary`, `text.secondary`, `onSolid.primary`.
- Prefer L adjustments; reduce C if needed.
- Initial targets (configurable):
  - `text.primary`: Lc 75-90
  - `text.secondary`: Lc 55-70
  - `onSolid.primary`: Lc 60-75
- Use `apca-w3` with WCAG2 fallback if needed.

## 9) Alpha scales

- Generate `a1..a12` for light/dark.
- Input: base color (step 9) + background (default light #ffffff, dark #111111).
- Method: fixed alpha curve + same base color.
- Default curve: `0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.95`.
- Output: #RRGGBBAA.

## 10) Token composer (preset radix-like-ui)

Minimal mapping (from `docs/Why.md`):

- `bg.app` -> neutral 1
- `bg.subtle` -> neutral 2
- `surface.card` -> neutral 2
- `surface.raised` -> neutral 3
- `component.bg` -> neutral 3
- `component.bgHover` -> neutral 4
- `component.bgActive` -> neutral 5
- `border.subtle` -> neutral 6
- `border.default` -> neutral 7
- `focus.ring` -> accent 8
- `accent.solid` -> accent 9
- `accent.solidHover` -> accent 10
- `text.secondary` -> neutral 11 (solver may adjust)
- `text.primary` -> neutral 12 (solver may adjust)
- `onSolid.primary` -> solver chooses white/black (+ alpha)

## 11) Exporters

- `toJson(theme)`
- `toCssVars(theme, { prefix })`
- `toTs(theme)` (exportable object)

## 12) Diagnostics (minimal)

- Out-of-gamut count per scale.
- APCA scores for critical tokens.
- Warnings: low chroma seed, very dark seed for light mode, etc.

## 13) Suggested structure

```text
src/
  index.ts
  generateScale.ts
  createTheme.ts
  types.ts
  data/
    radixSeeds.ts
  engine/
    templates.ts
    curves.ts
    gamut.ts
    oklch.ts
  contrast/
    apca.ts
  alpha/
    generateAlphaScale.ts
  tokens/
    presetRadixLikeUi.ts
  exporters/
    toJson.ts
    toCssVars.ts
    toTs.ts
  diagnostics/
    analyzeScale.ts
```

## 14) Tests (v0.1)

- `generateScale` deterministic (snapshot of steps).
- Template selection by hue.
- Gamut mapping does not exceed sRGB.
- `createTheme` generates basic tokens.
- Contrast solver hits targets (with tolerance).

## 15) Closed decisions

1) Radix as seed (step 9).
2) Store Radix seeds in repo.
3) OKLCH via `colorjs.io`.
4) APCA via `apca-w3` (with WCAG2 fallback).
5) Steps as `Record<Step, ColorHex>`.
6) Alpha: base step 9 with fixed curve (0.05..0.95).
7) Token preset starts with `docs/Why.md` map.
8) Tokens in dot notation.
9) Runtime: Node >= 22 (ESM) and TS >= 5.5.
