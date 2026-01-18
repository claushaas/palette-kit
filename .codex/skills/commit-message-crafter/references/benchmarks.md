# Benchmarks for Commit Messages

## Conventional Commits 1.0.0 (spec)

- Format: `type(scope): subject`
- Types describe intent, scopes narrow the area.
- Supports `BREAKING CHANGE:` footer.

## 50/72 rule (community best practice)

- Subject is short and imperative (<= 50-72 chars).
- Blank line before body.
- Body wrapped at ~72 chars, explains what/why.

## Common guidance (widely used)

- Use imperative mood: “Add”, “Fix”, “Refactor”.
- Be specific about user impact.
- Avoid low-signal words: “update”, “changes”, “stuff”.
- Prefer one commit per logical change.
