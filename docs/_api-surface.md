# API Surface Report (v0.2)

Source of truth: `package.json` exports and the entrypoint `src/index.ts`.

## Package entrypoint

- **Package name**: `@clhaas/palette-kit`
- **Entrypoint**: `dist/index.js` (types: `dist/index.d.ts`)
- **Exports map**: only `"."` is exported.

## Public exports (from `src/index.ts`)

### Functions

- **createTheme**
  - **Signature**: `createTheme(config: ThemeConfig): PaletteTheme`
  - **Source**: `src/core/createTheme.ts`
  - **Behavior**: creates a theme with `resolve`, `color`, `onSolid`, `withContext` that return *base* OKLCH data (not CSS strings).
  - **Public?** Yes (exported from package entry).

### Types / Interfaces

All types below are reexported from `src/types/index.ts`.

- **CssColorString** — `string`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorSpace** — `"srgb" | "p3" | "oklch"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorContext** — `"light" | "dark" | "highContrast" | "dimmed"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **SurfaceIntent** — `"app" | "surface" | "subtle" | "solid" | "overlay" | "data" | "transparent"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorState** — `"default" | "hover" | "active" | "selected" | "focus" | "disabled"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorEmphasis** — `"muted" | "subtle" | "default" | "strong" | "inverted"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **SemanticVariant** —

  ```ts
  "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "highlight" | "premium" | `category:${string}` | `chart:${string}`
  ```

  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorRole** — `string`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorUsage** — `"bg" | "border" | "text" | "icon" | "ring" | "shadow" | "stroke" | "fill"`
  - Source: `src/types/index.ts`
  - Public: Yes

- **BackgroundHint** —
  `{ kind: "auto" } | { kind: "role"; role: ColorRole } | { kind: "color"; value: CssColorString }`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ContrastRequirement** —
  `{ model: "apca"; targetLc: number; minLc?: number; maxLc?: number } | { model: "wcag2"; minRatio: number } | { model: "none" }`
  - Source: `src/types/index.ts`
  - Public: Yes

- **AlphaStrategy** —
  `{ mode: "none" } | { mode: "fixed"; alpha: number } | { mode: "solveOnBackground" }`
  - Source: `src/types/index.ts`
  - Public: Yes

- **OutputOptions** —
  `{ preferSpace?: ColorSpace; includeSpaces?: ColorSpace[]; gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress"; strict?: boolean; precision?: { l?: number; c?: number; h?: number; alpha?: number }; includeMeta?: boolean }`
  - Source: `src/types/index.ts`
  - Public: Yes
  - Notes: `format` is not part of v0.2.

- **RawColor** — `{ space: ColorSpace; channels: number[]; alpha: number }`
  - Source: `src/types/index.ts`
  - Public: Yes
  - Notes: still exported, used by `utils/parseColor`.

- **ColorMeta** — optional metadata for resolved colors
  - Source: `src/types/index.ts`
  - Public: Yes

- **ResolvedColor** —
  `{ value: CssColorString; srgb?: CssColorString; p3?: CssColorString; oklch?: CssColorString; alpha: number; meta?: ColorMeta }`
  - Source: `src/types/index.ts`
  - Public: Yes

- **ColorQuery** — user query for `theme.resolve`
  - Source: `src/types/index.ts`
  - Public: Yes

- **OnSolidQuery** — user query for `theme.onSolid`
  - Source: `src/types/index.ts`
  - Public: Yes

- **SemanticColorTheme** — interface for a fully-resolved theme
  - Source: `src/types/index.ts`
  - Public: Yes (type only)
  - Notes: actual `createTheme` returns `PaletteTheme` (see below).

### Types only exposed via `createTheme` signature

- **PaletteTheme** — `resolve/color/onSolid/withContext` returning `BaseResolvedColor`
  - Source: `src/core/createTheme.ts`
  - Public: exported by type from `createTheme.ts`, but not reexported from `src/index.ts`.

- **ThemeConfig** — configuration object for `createTheme`
  - Source: `src/engine/resolveBaseColor.ts`
  - Public: not exported from entrypoint; documented as config shape for `createTheme`.

## CLI

- **Bin**: `palette-kit` → `dist/cli.js` (from `package.json`)
- **Status**: no `src/cli.*` or `dist/cli.js` present in repo v0.2, so CLI behavior/flags cannot be documented.

## Exporters

- **Internal modules (not publicly exported via package entry)**:
  - `exportThemeCss`, `exportThemeJson` — `src/export/exportTheme.ts`
  - `serializeColor`, `serializeColorJson` — `src/export/serializeColor.ts`
- **Status**: not part of public API surface in v0.2 (no subpath exports in `package.json`).

## Presets

- **CurvePresetName** — `"modern" | "radixLike"` (internal)
  - Source: `src/presets/curves.ts`
- **curvePresets / modern / radixLike** — internal preset data
  - Source: `src/presets/curves.ts`
  - Status: not exported via package entry.
