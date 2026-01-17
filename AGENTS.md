# AGENTS

Guidance for agents working in this repo, derived from `docs/spec.md` (phases 0 and 1).

## Phase 0: Structure and dependencies

- Keep the folder layout under `src/` aligned with the spec: `core`, `engine`, `contrast`, `operators`, `export`, `presets`, `types`, `utils`.
- Keep the required dependencies available: `culori` and an APCA implementation (`apca-w3` is acceptable).

## Phase 1: Types and contracts

- Public types live in `src/types`. Implement these without business logic:
  `ColorContext`, `SurfaceIntent`, `ColorState`, `ColorEmphasis`, `SemanticVariant`,
  `ColorUsage`, `ColorRole`, `BackgroundHint`, `ContrastRequirement`, `AlphaStrategy`,
  `OutputOptions`, `ColorQuery`, `OnSolidQuery`, `ResolvedColor`, `ColorMeta`.
- Acceptance criteria: build must pass and there must be no circular imports.
