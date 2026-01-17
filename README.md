# Palette Kit

A small **color engine** for generating OKLCH-based palettes from semantic queries. v0.2 exposes only the resolver and types; serializers/exporters exist in source but are not part of the published entrypoint.

## What you get

- Deterministic OKLCH scales (12 steps) from light/dark seed colors
- Semantic resolution via `role`, `usage`, `surface`, `state`, `context`
- `onSolid` text/icon colors with APCA/WCAG2 contrast checks
- Strict validation for inputs (when `output.strict` is enabled)

## Basic mental model

Seed colors → preset curves → resolve step → state/emphasis operators → onSolid solver

## Quick start (3 minutes)

Install:

```bash
npm install @clhaas/palette-kit
```

Create a theme and resolve a background:

```ts
import { createTheme } from "@clhaas/palette-kit";

const theme = createTheme({
  seeds: {
    light: { neutral: "#111827", accent: "#3d63dd" },
    dark: { neutral: "#111827", accent: "#3d63dd" },
  },
});

const bg = theme.resolve({
  role: "bg.app",
  usage: "bg",
  surface: "app",
  context: "light",
});

console.log(bg.oklch); // { l, c, h, alpha }
```

Compute readable text on a solid background:

```ts
const onSolidText = theme.onSolid({
  bgRole: "action.primary",
  usage: "text",
  context: "light",
  contrast: { model: "apca", targetLc: 75 },
});
```

## How to use in Web

v0.2 returns OKLCH channel data. To use it in CSS, serialize it yourself or use internal serializers.

Minimal serializer (manual):

```ts
const toOklch = (c: { l: number; c: number; h: number; alpha?: number }) => {
  const a = c.alpha ?? 1;
  const alphaPart = a < 1 ? ` / ${a}` : "";
  return `oklch(${c.l}% ${c.c} ${c.h}${alphaPart})`;
};

const value = toOklch(bg.oklch);
```

Internal serializer (repo-only):

```ts
import { serializeColor } from "../src/export/serializeColor.js";

const value = serializeColor(bg.oklch, { preferSpace: "oklch" }).value;
```

## How to use in React Native

React Native expects color strings. Use the same serializer strategy as above and pass `value` directly to styles.

```ts
const rnColor = toOklch(onSolidText.oklch);
```

## Glossary (minimal)

- **role**: semantic name (e.g. `bg.app`, `text.primary`)
- **usage**: category (`bg`, `text`, `border`, `ring`, ...)
- **surface**: where it lives (`app`, `surface`, `solid`, ...)
- **context**: `light` or `dark`
- **state**: `default`, `hover`, `active`, ...
- **emphasis**: `muted`, `subtle`, `default`, `strong`
- **variant**: `neutral`, `accent`, `success`, ...

## Docs

- [docs/README.md](docs/README.md)
- [docs/_api-surface.md](docs/_api-surface.md)
- Usage guides:
  - [Web](docs/Usage-Web.md)
  - [React Native](docs/Usage-ReactNative.md)
  - [JSON](docs/Usage-JSON.md)

## Compatibility

- Package is ESM (`"type": "module"`).
- TypeScript types are published (`dist/index.d.ts`).
- React Native/Expo requires string serialization (see above).

## License

MIT — see [LICENSE](LICENSE).
