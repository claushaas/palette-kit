# Plan for Documentation

## Goals

- Explain the mental model (seed -> scale -> tokens).
- Show practical usage for devs without color expertise.
- Provide a visual demo to showcase quality.
- Keep docs minimal and honest while API is evolving.

## Phase 0 - GitHub README (now)

- Short intro and status (WIP).
- Install, quick start, and minimal API.
- Link to `docs/Why.md` and `docs/spec-implementation.md`.
- Clear scope: seeds + OKLCH + APCA.

## Phase 1 - Docs in repo

Create a small docs set in `docs/`:

- `docs/README.md`: index + navigation
- `docs/concepts.md`: seed, scale, step, role, gamut
- `docs/api.md`: generateScale, createTheme, exporters
- `docs/tokens.md`: preset `radix-like-ui` mapping
- `docs/contrast.md`: APCA targets and fallback
- `docs/alpha.md`: alpha scale rationale and curve
- `docs/faq.md`: common questions and limits

## Phase 2 - Website (recommended)

Goal: a visual demo + readable docs.

Suggested stack:

- Astro + MDX (fast, static, easy to host on GitHub Pages).
- Small interactive demo using vanilla JS or Preact.

Pages:

- Home: value proposition + quick example.
- Playground: seed input -> generated steps (light/dark).
- Docs: same content as `docs/` mirrored into site.
- Changelog/Roadmap.

Hosting:

- GitHub Pages (static export).
- Optional custom domain later.

## Open points

- Choose site stack (Astro vs VitePress).
- Decide if the playground ships in v0.1 or v0.2.
