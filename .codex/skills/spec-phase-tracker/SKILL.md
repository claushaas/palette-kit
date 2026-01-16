---
name: spec-phase-tracker
description: Track implementation progress against docs/spec.md phases, report gaps, and update checklists when comparing the repo to the spec.
---

# Spec Phase Tracker

Use this skill when asked to compare the repository to the implementation phases in `docs/spec.md` or to report progress by phase.

## Workflow

1. Read the relevant phase sections in `docs/spec.md`.
2. Map each phase item to concrete files or folders in `src/`.
3. Report status per phase item: done, partial, or missing, with file paths.
4. Call out acceptance criteria (build pass, no circular imports) when applicable.

## Notes

- Prefer `rg` for locating types, functions, or phase headers.
- Keep findings brief and actionable; cite exact files for gaps.
