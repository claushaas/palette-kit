---
name: review-guide
description: Review Palette Kit v0.3 changes using the official checklist and feedback template. Use when performing Copilot-assisted code reviews across phases 0-10 to verify contracts, DX, determinism, and phase-specific requirements.
---

# Copilot Review Guide

## Overview

Apply the v0.3 review checklist to code reviews and return actionable feedback with clear priorities.

## Workflow

1. Load the checklist reference: `references/review-guide-v0.3.md`.
2. Always run the "Criterios gerais" first, then the current phase checklist.
3. Flag any "O que NAO deve acontecer" violations as blockers.
4. Use the provided feedback template to structure the review.

## Notes

- Keep comments specific (file + line when possible).
- Prefer concise, actionable corrections.
- Do not approve if checklist blockers remain.
