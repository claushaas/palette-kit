---
name: color-pipeline-implementer
description: Implement the color pipeline stages (parse, normalize, scale, resolve) according to docs/spec.md phases 2-5.
---

# Color Pipeline Implementer

Use this skill when implementing the color pipeline stages described in `docs/spec.md`, especially phases 2 to 5.

## Workflow

1. Read phases 2 to 5 in `docs/spec.md` and identify required files.
2. Implement parsing in `src/utils/parseColor.ts` (hex/rgb to OKLCH, preserve alpha).
3. Implement normalization in `src/engine/normalize.ts` (clamp L/C/H, defaults, basic validation).
4. Implement base scales and semantic resolution in `src/engine/` as per spec ordering.
5. Add focused tests for each stage before moving to the next phase.

## Guardrails

- Keep logic incremental; avoid skipping phase boundaries.
- Preserve output contracts (`ResolvedColor`, `ColorMeta`) as defined in `src/types`.
- Prefer small PR-sized changes with clear acceptance criteria.
