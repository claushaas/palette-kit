---
name: type-contract-auditor
description: Audit public TypeScript types against src/planning/spec-v0.3.md, flag mismatches, and enforce acceptance criteria (build, no circular imports).
---

# Type Contract Auditor

Use this skill when asked to validate the public type contracts against `src/planning/spec-v0.3.md` or to report discrepancies.

## Workflow

1. Review the type list in `src/planning/spec-v0.3.md` and compare with `src/types`.
2. Check for missing types, duplicate union members, or mismatched optionals.
3. Verify supporting types like `RawColor` and `OutputOptions` align with spec notes.
4. Flag acceptance criteria issues: build failure risk or circular imports.

## Common checks

- Duplicated union members (e.g., `ColorState`).
- Optional fields that spec marks required (or vice versa).
- Extra types are acceptable if non-breaking; call them out as deltas.
