# CLI

Palette Kit v0.4 does not expose a public CLI.

There is no `bin` entry in the current package surface and no documented command
for generating tokens.

Use the runtime API directly:

```ts
import { createPaletteKit } from "@clhaas/palette-kit";

const palette = createPaletteKit({
  context: "light",
  intents: {
    brand: { hue: 260, chroma: 0.14 },
  },
});
```

CLI support may be added in a future phase, but it is not part of v0.4 current
implementation.
