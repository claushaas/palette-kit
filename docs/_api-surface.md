# API Surface Report (v0.3)

This report lists **only public exports** reachable from the package entrypoints and `package.json` exports/bin. It is the source of truth for documentation.

## Package entrypoint

- **Package name**: `@clhaas/palette-kit`
- **Entrypoint**: `dist/index.js` (types: `dist/index.d.ts`)
- **Exports map**:
  - `"."` → `dist/index.js`
  - `"./serialize"` → `dist/serialize.js`
  - `"./export"` → `dist/export.js`
  - `"./cli"` → `dist/cli.js`

## Public exports (from `"."`)

### Functions

- **createTheme**
  - **Signature**: `createTheme(config: ThemeConfig): PaletteTheme`
  - **Source**: `src/core/createTheme.ts`
  - **Notes**: `PaletteTheme` exposes `resolve`, `resolveMany`, `color`, `onSolid`, `serialize`, and `withContext`.

### Types / Interfaces

All items below are exported from `src/types/index.ts` and reexported by `src/index.ts`.

- **CssColorString** — `string`
- **ColorSpace** — `"srgb" | "p3" | "oklch"`
- **ColorContext** — `"light" | "dark" | "highContrast" | "dimmed"`
- **SurfaceIntent** — `"app" | "surface" | "subtle" | "solid" | "overlay" | "data" | "transparent"`
- **ColorState** — `"default" | "hover" | "active" | "selected" | "focus" | "disabled"`
- **ColorEmphasis** — `"muted" | "subtle" | "default" | "strong" | "inverted"`
- **SemanticVariant** —

  ```ts
  "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "highlight" | "premium" | `category:${string}` | `chart:${string}`
  ```

- **ColorRole** — `string`
- **ColorUsage** — `"bg" | "border" | "text" | "icon" | "ring" | "shadow" | "stroke" | "fill"`
- **BackgroundHint** — `{ kind: "auto" } | { kind: "role"; role: ColorRole } | { kind: "color"; value: CssColorString }`
- **ContrastRequirement** — `{ model: "apca"; targetLc: number; minLc?: number; maxLc?: number } | { model: "wcag2"; minRatio: number } | { model: "none" }`
- **AlphaStrategy** — `{ mode: "none" } | { mode: "fixed"; alpha: number } | { mode: "solveOnBackground" }`
- **OutputOptions** — `{ preferSpace?: ColorSpace; includeSpaces?: ColorSpace[]; gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress"; srgbFormat?: "hex" | "rgb" | "rgba"; strict?: boolean; precision?: { l?: number; c?: number; h?: number; alpha?: number }; includeMeta?: boolean }`
- **RawColor** — `{ space: ColorSpace; channels: number[]; alpha: number }`
- **ColorMeta** — metadata structure
- **ResolvedColor** — `{ value: CssColorString; srgb?: CssColorString; p3?: CssColorString; oklch?: CssColorString; alpha: number; meta?: ColorMeta }`
- **ColorQuery** — query for `theme.resolve`
- **OnSolidQuery** — query for `theme.onSolid`
- **TokenBackgroundHint** — token-safe background hint (no embedded literal colors)
- **TokenQuery** — token-safe query shape (no output/state; token background hints only)
- **TokenState** — interactive token state (excludes `"default"`)
- **TokenStates** — declarative supported states map
- **TokenDefinition** — declarative token definition
- **TokenRegistry** — token registry map

Additionally, config types for the CLI config file are exported as types:

- **PaletteConfig** — CLI config shape (type only)
- **TokenPresetName** — CLI token preset name union (type only)

## Serializer (`./serialize`)

- `serializeColor`
- `serializeResolved`
- `serializeColorJson` is not exported (internal helper)

## Exporters (`./export`)

- `exportThemeCss`
- `exportThemeJson`

## CLI

- **Bin**: `palette-kit` → `dist/cli.js`
- **Module**: `@clhaas/palette-kit/cli` → `dist/cli.js`

## CommonJS

v0.3 is ESM-only (`"type": "module"`). CommonJS consumers should use dynamic `import()`.

## Appendix: Observed runtime shapes (not exported)

The following shapes are **observed at runtime** but are not exported types. They are included here to clarify the contract, not to expand the public API.

- **BaseResolvedColor**
  - **Source**: `src/core/createTheme.ts` (return shape)

  ```ts
  {
    oklch: { l: number; c: number; h: number; alpha?: number };
    step: number;
    variantUsed: string;
    seedUsed: string;
  }
  ```
