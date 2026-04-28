# Palette Kit v0.4 Documentation

This directory documents the current v0.4 branch implementation.

The public runtime surface is intentionally small:

- `createPaletteKit`
- `palette.resolve`
- official resolver preset configs

The package root also reexports public TypeScript types. Internal modules,
serializers, registries, validators, and resolver helpers are not public API.

## Start Here

- [API](./API.md)
- [Configuration](./Config.md)
- [Concepts](./Concepts.md)
- [Architecture](./Architecture.md)
- [Validation](./Validation.md)
- [FAQ](./FAQ.md)

## Usage

- [Usage: Web](./Usage-Web.md)
- [Usage: React Native](./Usage-ReactNative.md)
- [Usage: JSON](./Usage-JSON.md)

## Status References

- [CLI](./CLI.md)
- [Exporters](./Exporters.md)
- [Tokens](./Tokens.md)
- [Diagnostics](./Diagnostics.md)
- [Alpha](./Alpha.md)
- [Overlays](./Overlays.md)
- [Text](./Text.md)
- [Why](./Why.md)

## v0.4 Planning References

- [v0.4 SPEC](../planning/v0.4/v0.4-palette-kit-spec.md)
- [Resolver Reference](../planning/v0.4/v0.4-resolver-reference.md)
- [Output Serialization Contract](../planning/v0.4/v0.4-output-serialization-contract.md)
- [Testing Strategy and Golden Cases](../planning/v0.4/v0.4-testing-strategy-golden-cases.md)

## Diagrams

- [Axes](../planning/v0.4/diagrams/axes.md)
- [Context](../planning/v0.4/diagrams/context.md)
- [Relations](../planning/v0.4/diagrams/relations.md)
- [Resolver Pipeline](../planning/v0.4/diagrams/resolver-pipeline.md)
- [What Never Happens](../planning/v0.4/diagrams/what-never-happens.md)

## Historical Documents

- [Legacy spec](./spec-legacy.md)

The legacy spec and manifesto files are historical context. They do not define
the current v0.4 public API.
