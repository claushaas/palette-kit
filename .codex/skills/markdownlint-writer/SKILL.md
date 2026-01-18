---
name: markdownlint-writer
description: Write or edit Markdown files while conforming to markdownlint rules used in this repo.
---

# Markdownlint Writer

Use this skill whenever creating or editing `.md` files. It enforces markdownlint formatting rules so changes pass `npm run lint:md`.

## Core rules to follow

- Surround headings with a blank line above and below.
- Surround lists with a blank line above and below.
- Do not use emphasis as a heading; use actual headings.
- Provide a language for fenced code blocks (e.g., `ts`, `json`, `css`).
- Surround fenced code blocks with blank lines.
- Use consistent table spacing: add spaces around pipe separators.
- Avoid multiple consecutive blank lines.

## Editing checklist (before save)

1. Check headings have blank lines around them.
2. Ensure every list has blank lines before and after.
3. Ensure fenced code blocks include a language.
4. Ensure fenced code blocks have blank lines before and after.
5. Confirm tables use spaced pipes: `| Col | Col |`.
6. Remove accidental double blank lines.

## Validation

- Run `npm run lint:md -- <path>` when asked to fix markdownlint issues.
- If markdownlint still fails, scan for missing blank lines around headings/lists.
