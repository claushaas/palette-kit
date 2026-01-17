---
name: phase-implementation-runbook
description: Enforce the phase implementation workflow (branch -> implement -> lint/typecheck/test/build -> diff patch -> wait for confirmation -> commit/push/PR) for Palette Kit v0.3 phases.
---

# Phase Implementation Runbook

Use this skill whenever implementing a roadmap phase. It enforces the agreed step-by-step process and adds guardrails for clean reviews.

## Workflow (must follow in order)

1) Preflight and scope

- Read the target phase from `src/planning/roadmap-v0.3.md` and any referenced specs.
- Confirm branch name format: `phase-<number>-<short-slug>`.
- Check `git status -sb` and call out unrelated changes before proceeding.

2) Create branch

- Create the branch from `v0.3` (or current branch if already on `v0.3`).
- Verify with `git status -sb`.

3) Implement the phase

- Make only changes required for the phase.
- Keep docs updated when required by the phase (e.g., spec references).
- Do not add unrelated refactors.
- If editing `.md` files, follow the markdownlint rules (use the markdownlint-writer skill).

4) Validate in order

- Run these commands in an order that surfaces fast failures first:
  1. `npm run lint:md` (if docs touched)
  2. `npm run lint`
  3. `npm run typecheck`
  4. `npm run test`
  5. `npm run build`
- If any step fails, fix and rerun from the failing step onward.

5) Summarize changes and produce diff patch for review

- Capture a quick summary with `git diff --stat`.
- Generate a patch file for external review, e.g.:
  - `git diff > /tmp/phase-<number>.patch`
- Report the patch path and wait for explicit confirmation to commit and push.

6) After confirmation: commit, push, PR

- Craft Conventional Commit message(s) in English.
- Commit only the phase-related changes.
- Push the branch.
- Open a PR with base `v0.3` and a clear summary.

## Guardrails

- If you notice unexpected changes you did not make, stop and ask how to proceed.
- Never amend commits unless explicitly requested.
- Do not run destructive git commands.

## Output checklist

Always end the phase work (pre-confirmation) with:

- Tests/validation results summary.
- Patch path.
- A prompt asking for confirmation to commit/push/PR.
