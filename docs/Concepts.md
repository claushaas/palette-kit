# Concepts

This document explains the concepts that are implemented in v0.2 **as shown in code**. If a concept is listed but not present in the code, it is explicitly marked.

## Seed / source colors

`createTheme` requires seed colors for **light** and **dark** contexts:

```ts
const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});
```

These seeds are parsed to OKLCH and used to generate 12-step scales per surface.

## Steps 1–12

The engine generates **12 steps** per surface (`generateScale`). Steps are indexed by role/usage rules in `resolveBaseColor`:

- `bg.app` → step 1
- `bg.surface` → step 2
- `bg.subtle` → step 3
- `bg.solid` → step 9
- `text` / `icon` → step 11

Step selection is controlled by `usage` + `surface` and clamped to `[1..12]`.

### Step mapping table (from `resolveStep`)

This table is derived from the current `resolveStep` logic and reflects behavior in v0.2. It is not a guaranteed semantic contract.

| usage  | surface       | step |
|--------|---------------|------|
| bg     | app           | 1    |
| bg     | surface       | 2    |
| bg     | subtle        | 3    |
| bg     | solid         | 9    |
| bg     | overlay       | 2    |
| bg     | data          | 9    |
| bg     | transparent   | 1    |
| border | solid         | 8    |
| border | data          | 8    |
| border | (others)      | 6    |
| text   | (any)         | 11   |
| icon   | (any)         | 11   |
| ring   | (any)         | 8    |
| stroke | data          | 9    |
| stroke | (others)      | 8    |
| fill   | (any)         | 9    |

Defaults are applied when a surface isn’t listed explicitly.

## Light / Dark contexts

Queries are normalized with `context` (`light`/`dark`) and map to the corresponding seed set and curve range.

## Slots / tokens (v0.2)

There is **no public token system** in the package entrypoint. Internally, roles are strings like `bg.app`, `text.primary`, `action.primary` and are interpreted by the resolver.

## Alpha scales

There is no standalone “alpha scale” API. Alpha is represented by:

- `AlphaStrategy` on `ColorQuery` / `OnSolidQuery`
- `onSolid` defaults to fixed alpha (text `0.92`, icon `0.72`)

## Overlays

Overlays are treated as a `surface: "overlay"` and `usage: "bg"`. The `resolveStep` mapping uses the overlay range in presets.

## Text scales

There is no explicit “text scale” API. Text is resolved by `usage: "text"` and the contrast solver in `onSolid`.

## Anchor step

**Not implemented in v0.2.** There is no anchor-step or pinning mechanism in the codebase.

## Wide gamut / Display-P3

The internal serializer supports `color(display-p3 ...)`, and `OutputOptions` accepts `"p3"` as a preferred or included space. However, exporters/serializers are **not** part of the public entrypoint in v0.2. Public consumers must handle any wide-gamut serialization themselves.

## Role interpretation (variant inference)

`resolveBaseColor` infers a variant from role prefixes when `variant` is not provided:

- `action.*` → `accent`
- `bg.*`, `surface.*`, `border.*`, `text.*` → `neutral`
- anything else → `neutral`

The internal serializer supports `display-p3` strings, and `OutputOptions.preferSpace/includeSpaces` accept `"p3"`. However, **exporters/serializers are not publicly exported** in v0.2.
