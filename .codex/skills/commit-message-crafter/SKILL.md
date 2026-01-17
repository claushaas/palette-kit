---
name: commit-message-crafter
description: Generate best-practice git commit messages (Conventional Commits) by inspecting changes, choosing type/scope, and producing concise, high-signal summaries in English.
---

# Commit Message Crafter

Use this skill when the user wants help writing commit messages or asks for best commit messages. When the change set spans distinct concerns (features, fixes, docs, tests), prefer multiple focused commits instead of one large commit.

## Quick workflow

1) **Inspect context and split when needed**

- Prefer `git status -sb` and `git diff` (or PR summary if provided).
- Identify: what changed, why, and impact.
- Detect breaking change risk and migrations.
- Group changes by concern (e.g., fix vs test vs docs). If there is more than one clear concern, plan multiple commits.

1) **Use Conventional Commits only**

- Always use Conventional Commits; do not ask about other styles.

1) **Craft the message(s)**

- Subject is **imperative**, **short**, and **specific**.
- **Avoid**: “WIP”, “misc”, “stuff”, “update”, or long diffs in subject.
- Keep ASCII unless the repo clearly uses non-ASCII.
- Always write commit messages in English.
- If multiple commits are planned, propose a commit plan (ordering + scope) and produce a message for each.

1) **Optional body and footer**

- Use a body when the change is non-trivial or has tradeoffs.
- Wrap body at ~72 chars, use short bullets if helpful.
- Add `BREAKING CHANGE:` footer when applicable.
- Add issue refs if provided by the user.

## Conventional Commits template

```txt
<type>(<scope>): <subject>

<body optional>

<footer optional>
```

**Types** (choose the most accurate):

- `feat` new user-facing behavior
- `fix` bug fix
- `refactor` code change without behavior change
- `perf` performance improvement
- `docs` documentation only
- `test` tests only
- `chore` maintenance, tooling
- `build` build system or dependencies
- `ci` CI-related
- `style` formatting-only changes

## Reference benchmarks

Read `references/benchmarks.md` if you need formal standards or reminders.
