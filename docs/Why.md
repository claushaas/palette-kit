# Palette Kit

## 0) Overview

### The real problem

A modern design system needs colors that are:

- **Perceptually consistent** (the scale rises smoothly to the eye, not in RGB).
- **Semantic** (each step has a clear usage: background, surface, border, solid, text).
- **Accessible** (text is truly readable with proper contrast).
- **Reproducible** (same seed -> same palette).
- **Extensible** (categories, charts, badges, custom states).
- **Compatible with the modern world** (sRGB and Display-P3, serious dark mode, exportable tokens).

Radix is great as a UX and ergonomics model, but the engine can be modernized.

### The proposal

Build a library that:

1. Takes a **single seed color** to generate Radix-like 12-step scales.
2. Optionally takes more seeds (neutral, background, etc.) for tighter control.
3. Produces light/dark, alphas, and intent-based tokens.
4. Uses **OKLCH** for generation and **APCA (WCAG 3)** for contrast (with fallback).

**Result:** a Radix-like 2025 engine with solid math and practical UX.

---

## 1) Principles (the laws of the kingdom)

### 1.1 Tokens by intent, not by color

Consumers should use:

- `bg.app`
- `surface.card`
- `border.subtle`
- `accent.solid`
- `text.primary`

And **never**: `blue9`, `purple11` directly.

### 1.2 The scale has fixed semantics

Keep 12 steps because it is a great mental map:

- **1-2**: backgrounds
- **3-5**: component backgrounds (default/hover/active)
- **6-8**: borders/focus
- **9-10**: solid backgrounds (default/hover)
- **11-12**: text (secondary/primary)

This is operational gold. Innovation belongs in the engine.

### 1.3 Generation in perceptual space (OKLCH)

The scale is born in **OKLCH** and only converted to sRGB/P3 at the end.

### 1.4 Contrast is solved, not guessed

Modernization: text (and sometimes borders) should be **resolved by a contrast solver**, not by a hardcoded L value.

### 1.5 Gamut is real, not a detail

Many OKLCH colors do not fit in sRGB. The system needs a strategy:

- clip (worst)
- compress (better)
- or use **Display-P3** when available

---

## 2) Glossary (for humans and AIs to speak the same language)

- **Seed**: initial color provided by the user (ex: `#FF3EA5`)
- **Scale**: set of 12 colors for a family (accent, category, etc.)
- **Step**: index from 1 to 12 inside a scale
- **Role**: semantic token consumed by the app (ex: `cta.bg`)
- **OKLCH**: perceptual space with Lightness (L), Chroma (C), Hue (H)
- **APCA**: modern perceptual contrast metric (WCAG 3)
- **Gamut**: device color range (sRGB vs Display-P3)
- **Alpha scale**: steps with transparency for overlays/text

---

## 3) Radix-like 2025: library architecture

### 3.1 Main modules

#### (A) Engine (core)

- Convert colors to OKLCH
- Generate 12 steps for light and dark
- Apply curves, heuristics, and gamut mapping

#### (B) Contrast solver

- Given (foreground candidate, background) -> adjust until target APCA
- Prefer OKLCH adjustments (L and/or C)

#### (C) Alpha generator

- Produce useful alpha versions (overlays) based on theme background

#### (D) Token composer

- Map scales -> roles (bg/surface/border/text/solid)
- Apply overrides
- Export formats: TS/JSON/CSS vars/Tailwind/RN

#### (E) Validation and diagnostics

- Reports: contrast scores, gamut clipping, warnings
- Strict mode (error) and soft mode (warn)

---

## 4) Public interfaces (package API)

### 4.1 Single-color generation (main case)

```ts
generateScale({
  seed: "#FF3EA5",
  mode: "both", // light+dark
  model: "oklch-apca",
  intent: "accent",
});
```

Returns:

- `scale.light.steps[1..12]`
- `scale.dark.steps[1..12]`
- `scale.meta` (diagnostics)

### 4.2 Full theme composition (optional)

```ts
createTheme({
  neutral: { source: "radix", name: "slate" },
  accent: { source: "seed", value: "#3D63DD" },
  semantic: {
    success: { source: "radix", name: "green" },
    warning: { source: "seed", value: "#F5B400" },
    danger: { source: "radix", name: "red" },
  },
  extras: {
    category1: { source: "seed", value: "#FF3EA5" },
    chart1: { source: "seed", value: "#00C2FF" },
  },
  tokens: { preset: "radix-like-ui" },
  output: { cssVars: true, prefix: "pk" },
});
```

### 4.3 Exporters

- `toCssVars(theme, { prefix })`
- `toJson(theme)`
- `toTailwind(theme)`
- `toReactNative(theme)`

---

## 5) Scale generation engine (OKLCH + templates + curves)

### 5.1 Why templates still matter

Material You proved that a single seed can generate a full system, but real UI needs predictability.

Templates provide:

- a proven scale shape (where chroma grows and falls)
- consistency across different colors
- a strong starting point for dark mode

**Plan:** keep a template catalog (inspired by Radix, converted to OKLCH).

### 5.2 Template selection by hue

- Convert seed -> OKLCH
- Pick template with closest hue (angular distance)

This avoids a pink seed ending up in a green template.

### 5.3 Anchor step (default: 9)

- Step 9 represents "solid"
- Make `seed ~= step9` so the chosen color maps to a solid button

### 5.4 Delta and application

Calculate delta between seed and template[9]:

- `dL = L_seed - L_t9`
- `dC = C_seed - C_t9`
- `dH = H_seed - H_t9`

Apply across 12 steps with **curves per band**.

### 5.5 Curves (the Radix-like sauce)

The scale is not linear. It is a set of UI tradeoffs:

- Steps 1-2 must be respectful with backgrounds
- Steps 11-12 must exist for text, not just for swatches

Initial curves (v1):

#### Lightness curve

- 1-2: 0.25-0.35
- 3-5: 0.55-0.70
- 6-8: 0.75-0.90
- 9-12: 1.00

#### Chroma curve

- 1-2: 0.15-0.25
- 3-5: 0.50-0.70
- 6-8: 0.70-0.90
- 9-10: 1.00
- 11-12: 0.60-0.80 (reduce chroma for text)

#### Hue

- apply full `dH`, but allow hue lock near extremes to avoid weird shifts

### 5.6 Dark mode: do not invent, use dark templates

Repeat with dark templates. This yields a product-like dark mode, not a spreadsheet inversion.

---

## 6) The real modernization: contrast solver (APCA-first)

### 6.1 Why APCA

WCAG 2 ratio is useful, but often fails in real legibility, especially in dark mode and small text.

APCA recognizes that:

- dark text on light != light text on dark
- size, weight, and polarity matter

### 6.2 Where to apply the solver

Do not solve everything. Focus on critical tokens:

- `text.primary` (step 12)
- `text.secondary` (step 11)
- `onSolid.text` (text on steps 9/10)
- `link`/`accentText` if present
- possibly `focusRing`

### 6.3 How the solver works (concept)

Given:

- background (ex: `bg.app`)
- foreground candidate (ex: `scale[12]`)

Adjust until reaching a target.

Suggested order:

1. adjust **Lightness (L)** first
2. if gamut breaks or it looks bad, reduce **Chroma (C)**
3. hue rarely needs to change

### 6.4 Suggested targets (initial)

Define product-focused targets:

- `text.primary` -> APCA ~ **Lc 75-90**
- `text.secondary` -> **Lc 55-70**
- `onSolid.primary` -> **Lc 60-75**
- `disabled` -> should look disabled but remain legible when needed

Offer presets:

- `contrastProfile: "standard" | "strict" | "relaxed"`

### 6.5 Fallback (real world)

APCA is not everywhere yet. So:

- use APCA when available
- fallback to WCAG2 ratio (or L heuristics)

---

## 7) Text on solids: replace a hardcoded list

Instead of "yellow/amber/lime use black text":

1. compute contrast of step9 with **white** and **black**
2. choose the better one (or the one that hits target with less adjustment)
3. apply alpha (0.92/0.72/0.48) or solve alpha to reach target APCA

This removes:

- hardcoded lists
- surprising exceptions
- bugs with near-yellow seeds

---

## 8) Alpha scales (a1..a12): from pretty to useful

### 8.1 What alpha should represent

Alpha scales are especially useful for:

- soft overlays
- hover/active backgrounds for ghost components
- text tint without creating new hex colors

### 8.2 Without background info

In single-color mode, use defaults:

- light: `#FFFFFF`
- dark: `#111111`

### 8.3 With a theme background

Alpha scale can be resolved against the actual background for better results.

---

## 9) Gamut and Display-P3 (the modern world lives here)

### 9.1 Why it matters

OKLCH can generate colors that do not fit in sRGB. If you just clip, it looks bad.

### 9.2 Recommended strategy (v1)

- generate in OKLCH
- convert to sRGB
- if out of gamut, reduce C until it fits

### 9.3 Recommended strategy (v2)

- offer two outputs:
  - `steps.srgb`
  - `steps.p3`
- export CSS with `color(display-p3 ...)` when supported

---

## 10) Tokens: the radix-like-ui preset

### 10.1 Minimal modern preset

- `bg.app` -> neutral 1
- `bg.subtle` -> neutral 2
- `surface.card` -> neutral 2
- `surface.raised` -> neutral 3
- `component.bg` -> neutral 3
- `component.bgHover` -> neutral 4
- `component.bgActive` -> neutral 5
- `border.subtle` -> neutral 6
- `border.default` -> neutral 7
- `focus.ring` -> accent 8
- `accent.solid` -> accent 9
- `accent.solidHover` -> accent 10
- `text.secondary` -> neutral 11 (solver may adjust)
- `text.primary` -> neutral 12 (solver may adjust)
- `onSolid.textPrimary` -> solver chooses white/black (+ alpha)

### 10.2 Extras (categories/charts)

- `category.n.solid` -> categoryN 9
- `category.n.subtle` -> categoryN 3
- `chart.n.line` -> chartN 9
- `chart.n.fill` -> chartN 9 + alpha

---

## 11) Diagnostics and "engineer mode"

### Quality report per scale

- steps out of gamut (count)
- contrast for critical tokens (APCA/WCAG)
- warning for low chroma seed (too gray)
- warning for very dark seed in light mode

### Diagnostics API

- `analyzeScale(scale, { background })`
- `analyzeTheme(theme)`

---

## 12) Incremental plan (practical execution)

### Sprint 0 - Infra

- TS build (tsup)
- tests (vitest/jest)
- color conversions (OKLCH)
- package structure and exports

### Sprint 1 - Single-color scale (light)

- template selection by hue
- anchor step 9
- curves v1 (L/C)
- gamut compression
- output `steps[1..12]` in hex

### Sprint 2 - Dark mode

- dark templates
- parallel light/dark generation

### Sprint 3 - OnSolid automatic

- choose white vs black by contrast
- apply default alpha

### Sprint 4 - Contrast solver (APCA)

- integrate APCA (or fallback)
- solver for text 11/12 and onSolid

### Sprint 5 - Alpha scale

- generate a1..a12 with default background
- allow custom background

### Sprint 6 - Token composer + exporters

- preset `radix-like-ui`
- exports TS/JSON/CSS vars
- optional RN/Tailwind integration

### Sprint 7 - Visual QA

- generate preview pages
- visual snapshots (Playwright)

---

## 13) What makes this library special

1. **Simple input (1 color)**, serious output (12 steps + dark + onSolid)
2. **UI semantics preserved** (low learning curve)
3. **Contrast solved**, not expected
4. **Diagnostics** that prevent pretty-but-useless palettes
5. Clear path to **Display-P3** without breaking the MVP

---

## 14) Next artifact (to start coding safely)

The next ideal document is an implementation spec with:

- file structure
- TS types (Scale, Step, Theme, Role)
- final function signatures
- pseudo-code for v1 generator
- initial template list (converted to OKLCH)

If you want, I can write that spec as "Sprint 0-2 ready for implementation" with file checklists and expected tests.
