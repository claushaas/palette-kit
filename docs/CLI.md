# CLI

Palette Kit v0.3 ships a CLI binary:

```json
{
  "bin": { "palette-kit": "./dist/cli.js" }
}
```

## Commands

### `palette-kit init`

Creates a typed `palette.config.ts`.

Flags:

- `--path <dir>` output directory (default: current directory)
- `--force` overwrite existing config

### `palette-kit build`

Builds deterministic artifacts in `dist/palette/`:

- `tokens.css`
- `tokens.json`
- `tokens.ts`
- `tokens.d.ts`
- `report.md` (optional; `--report`)

Flags:

- `--config <path>` config file path (default: `palette.config.ts`)
- `--outDir <dir>` output directory (default: `dist/palette`)
- `--report` write `report.md`

## Config loading notes

`palette-kit build` loads the config via ESM `import()`.

- If you use a TypeScript config (`palette.config.ts`), Node needs a TS loader.
- Alternative: use a `.mjs` config and pass `--config palette.config.mjs`.
