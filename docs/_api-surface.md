# API Surface Report

This report reflects the current v0.4 branch package root.

## Runtime Exports

- `createPaletteKit`
- `defaultResolverConfig`
- `neutralResolverConfig`
- `softResolverConfig`
- `strongResolverConfig`

## Type Exports

- `PaletteKitConfig`
- `PaletteKit`
- `PaletteResolveOptions`
- `PaletteResolveOutput`
- `Usage`
- `Level`
- `State`
- `StateDeltaDirection`
- `Context`
- `ColorOutput`
- `OklchColor`
- `RgbColor`
- `RgbaColor`
- `IntentDefinition`
- `ResolverPresetName`
- `ResolverConfig`
- `RelationParamsConfig`
- `ChromaConfig`

## Public Package Exports

Only the root export is public:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  }
}
```

## Not Exported

- CLI
- exporter subpaths
- intent registry helpers
- internal resolver helpers
- serializer functions
