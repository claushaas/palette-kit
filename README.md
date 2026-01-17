# Palette Kit

A small color engine for generating OKLCH-based palettes from semantic queries. It focuses on deterministic OKLCH scales, semantic roles, and contrast-aware text-on-solid handling.

This documentation is generated **from the v0.2 code** and reflects the exact public API available in this repository.

## Why it exists

UI color systems often drift into ad-hoc hex values, inconsistent steps, and fragile contrast decisions. Palette Kit provides a single place to:

- define seed colors for light/dark modes
- generate OKLCH scales deterministically
- resolve semantic colors by role/usage/state
- compute `onSolid` text/icon colors with contrast checks

## Quick start (3 minutes)

Install:

```bash
npm install @clhaas/palette-kit
```

Create a theme and resolve colors:

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

Compute text/icon colors on a solid background with contrast solving:

```ts
const onSolidText = theme.onSolid({
  bgRole: "action.primary",
  usage: "text",
  context: "light",
  contrast: { model: "apca", targetLc: 75 },
});

console.log(onSolidText.oklch);
```

> v0.2 returns **OKLCH channel data**, not CSS strings. Exporters/serializers exist in source but are not part of the public package export. See `docs/Exporters.md`.

## Documentation

- [docs/README.md](docs/README.md)
- [docs/Why.md](docs/Why.md)
- [docs/Concepts.md](docs/Concepts.md)
- [docs/Architecture.md](docs/Architecture.md)
- [docs/API.md](docs/API.md)
- [docs/Config.md](docs/Config.md)
- [docs/Exporters.md](docs/Exporters.md)
- [docs/CLI.md](docs/CLI.md)
- [docs/FAQ.md](docs/FAQ.md)
