# API Surface Report (v0.2)

This report lists **only public exports** reachable from the package entrypoint (`src/index.ts`) and `package.json` exports/bin. It is the source of truth for documentation.

## Package entrypoint

- **Package name**: `@clhaas/palette-kit`
- **Entrypoint**: `dist/index.js` (types: `dist/index.d.ts`)
- **Exports map**: only `"."` is exported.

## Public exports (from `src/index.ts`)

### Functions

- **createTheme**
  - **Signature**: `createTheme(config: ThemeConfig): PaletteTheme`
  - **Source**: `src/core/createTheme.ts`
  - **Notes**: `ThemeConfig` is an object shape (see API.md). `PaletteTheme` is the returned object shape (see API.md).

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
- **OutputOptions** — `{ preferSpace?: ColorSpace; includeSpaces?: ColorSpace[]; gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress"; strict?: boolean; precision?: { l?: number; c?: number; h?: number; alpha?: number }; includeMeta?: boolean }`
- **RawColor** — `{ space: ColorSpace; channels: number[]; alpha: number }`
- **ColorMeta** — metadata structure
- **ResolvedColor** — `{ value: CssColorString; srgb?: CssColorString; p3?: CssColorString; oklch?: CssColorString; alpha: number; meta?: ColorMeta }`
- **ColorQuery** — query for `theme.resolve`
- **OnSolidQuery** — query for `theme.onSolid`
- **SemanticColorTheme** — interface type (not returned by `createTheme` in v0.2)

## CLI

- **Bin**: `palette-kit` → `dist/cli.js` (declared in `package.json`)
- **Status**: CLI is declared but not shipped in this repo tag (no `src/cli.*`).

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
