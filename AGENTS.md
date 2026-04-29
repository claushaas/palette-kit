
# AGENTS.md — Claus Standard

> **Primary principle**
> This file exists to allow an AI coding agent to work in this repository **without additional clarification**, executing real commands and respecting explicit constraints.

---

## 1. Ground rules (non-negotiable)

- Use **TypeScript in strict mode** when applicable.
- Prefer **simple, explicit, readable code** over clever abstractions.
- Avoid implicit side effects.
- Do not introduce new dependencies without clear justification.
- Do not break public APIs without explicit alignment.

If something is unclear, **stop and ask before proceeding**.

---

## 2. Project type

- TypeScript ESM library with optional CLI tooling.

---

## 3. Dependencies

- Keep the required APCA implementation available (`apca-w3` is acceptable).

---

## 4. Repository structure

- Keep the folder layout under `src/` aligned with the spec: `core`, `engine`, `contrast`, `operators`, `export`, `presets`, `types`, `utils`.

---

## 5. Environment and setup

- Install dependencies:

  ```text
  npm install
  ```

- Build:

  ```text
  npm run build
  ```

- Tests:

  ```text
  npm test
  ```

- Typecheck:

  ```text
  npm run typecheck
  ```

- Lint:

  ```text
  npm run lint
  ```

- Markdown lint:

  ```text
  npm run lint:md
  ```

---

## 6. Output and module format

- Package is ESM only (`"type": "module"`).
- Subpath exports are defined in `package.json`.

---

## 7. Code style

- Small, cohesive functions and modules.
- Explicit names over short names.
- Prefer pure functions when possible.
- Organize code by **feature**, not by type.
- File and folder names in **English**.
- Content (strings, docs, comments) must be in **English**.

---

## 8. Typing and contracts

- Types are **contracts**, not suggestions.
- Avoid `any`.
- Prefer `unknown` with explicit narrowing.
- Do not weaken types just to “make things pass.”

If an existing type is incorrect:

- fix the type
- update its usages
- add tests when applicable

Public types live in `src/types/index.ts` and must not contain business logic.
Keep the public surface aligned with `docs/` and v0.4 planning contracts.

---

## 9. Documentation sources

- Current public docs live in `docs/`.
- v0.4 planning docs live in `planning/v0.4`.

---

## 10. Testing and validation

- Always run `npm test` before completing a task.

If no tests exist:

- do not create a full test suite without confirmation
- explicitly document introduced risks

Meaningful new code **must include tests**, unless explicitly exempted.

---

## 11. Linting, formatting, and quality

- Run `npm run lint` when applicable.
- Do not modify lint rules without approval.
- Do not reformat unrelated files without a technical reason.

---

## 12. Safety and consistency

- Do not invent commands or workflows not present in the repo.
- If a rule is unclear or missing, ask the dev before proceeding.

---

## 13. Commits and pull requests

- Small, focused commits.
- Descriptive commit messages (no emojis).
- Do not mix refactors, features, and fixes in the same commit.

---

## 14. Agent scope and self-control

- Do not implement improvements outside the requested scope.
- Do not restructure folders without functional justification.
- Do not rename things based on preference alone.

If relevant technical debt is identified:

- describe it clearly
- propose a solution
- **do not implement without approval**

---

## 15. Security and data handling

- Never expose secrets.
- Do not log sensitive data.
- Do not copy external code without verifying its license.

---

## 16. When to stop and ask

The agent **must stop and request confirmation** when:

- changes are architectural
- multiple valid approaches exist
- required commands are undefined
- naming decisions affect public APIs

---

## 17. Repository facts

- Project type: TypeScript ESM library with optional CLI tooling.
- `src/` layout must follow: `core`, `engine`, `contrast`, `operators`, `export`, `presets`, `types`, `utils`.
- Required dependencies: an APCA implementation (`apca-w3` is acceptable).
- Public types live in `src/types/index.ts` and must not contain business logic.
- Planning docs for v0.4 live in `planning/v0.4`.
- Public docs live in `docs/`.
- Subpath exports are defined in `package.json`.

---

## 18. Language rules

- Chat responses must be in Portuguese.
- All files written in the repository must be in English.
