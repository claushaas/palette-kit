---
name: contrast-solver-helper
description: Implement APCA/WCAG2 contrast requirements and solver behavior per docs/spec.md phase 6, with minimal tests.
---

# Contrast Solver Helper

Use this skill when implementing or validating contrast logic, APCA/WCAG2 targets, or solver behavior in `src/contrast`.

## Workflow

1. Read phase 6 in `docs/spec.md` and extract solver requirements.
2. Implement contrast evaluation for APCA and WCAG2.
3. Implement solver behavior for targets and failure modes (best-effort vs strict).
4. Add minimal tests for target attainment and failure handling.

## Guardrails

- Respect `ContrastRequirement` and `OutputOptions.strict` behavior.
- Prefer deterministic solver paths; document edge-case behavior.
