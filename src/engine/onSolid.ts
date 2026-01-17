import { converter } from "culori";

import { computeApcaLc } from "../contrast/apca.js";
import { solveContrast } from "../contrast/solver.js";
import { contrastRatio } from "../contrast/wcag2.js";
import type { ContrastRequirement, OnSolidQuery } from "../types/index.js";
import { applyOperators } from "./applyOperators.js";
import { mapColorContextToEngine } from "./context.js";
import type { OkLchColor } from "./generateScale.js";
import { normalizeOnSolidQuery, normalizeQuery } from "./normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "./resolveBaseColor.js";
import { resolveBaseColor } from "./resolveBaseColor.js";

type SrgbColor = { r: number; g: number; b: number };

const toSrgb = converter("rgb");

const nearWhite: OkLchColor = { l: 97, c: 0, h: 0, alpha: 1 };
const nearBlack: OkLchColor = { l: 15, c: 0, h: 0, alpha: 1 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toSrgbColor = (color: OkLchColor): SrgbColor | null => {
  const rgb = toSrgb({ mode: "oklch", l: clamp(color.l, 0, 100) / 100, c: color.c, h: color.h });

  if (!rgb) {
    return null;
  }

  const r = typeof rgb.r === "number" && Number.isFinite(rgb.r) ? clamp(rgb.r, 0, 1) : 0;
  const g = typeof rgb.g === "number" && Number.isFinite(rgb.g) ? clamp(rgb.g, 0, 1) : 0;
  const b = typeof rgb.b === "number" && Number.isFinite(rgb.b) ? clamp(rgb.b, 0, 1) : 0;

  return { r, g, b };
};

const blend = (fg: SrgbColor, bg: SrgbColor, alpha: number): SrgbColor => ({
  r: fg.r * alpha + bg.r * (1 - alpha),
  g: fg.g * alpha + bg.g * (1 - alpha),
  b: fg.b * alpha + bg.b * (1 - alpha),
});

const defaultContrastForUsage = (usage: OnSolidQuery["usage"]): ContrastRequirement => ({
  model: "apca",
  targetLc: usage === "text" ? 75 : 60,
});

const validateFixedAlpha = (alpha: number) => {
  if (alpha < 0 || alpha > 1) {
    throw new Error("Fixed alpha must be between 0 and 1");
  }

  return alpha;
};

const resolveAlphaStrategy = (
  alpha: OnSolidQuery["alpha"] | undefined,
  usage: OnSolidQuery["usage"],
  strict: boolean,
): { mode: "none" } | { mode: "fixed"; alpha: number } => {
  if (!alpha) {
    return { mode: "fixed", alpha: usage === "text" ? 0.92 : 0.72 };
  }

  if (alpha.mode === "none") {
    return alpha;
  }

  if (alpha.mode === "fixed") {
    return { mode: "fixed", alpha: validateFixedAlpha(alpha.alpha) };
  }

  if (strict) {
    throw new Error('onSolid does not support alpha.mode "solveOnBackground"');
  }

  console.warn(
    'onSolid does not support alpha.mode "solveOnBackground"; falling back to fixed defaults',
  );
  return { mode: "fixed", alpha: usage === "text" ? 0.92 : 0.72 };
};

const checkContrastWithAlpha = (
  fg: OkLchColor,
  bg: OkLchColor,
  req: ContrastRequirement,
  alpha: number,
): { pass: boolean; value: number } => {
  if (req.model === "none") {
    return { pass: true, value: 0 };
  }

  const fgSrgb = toSrgbColor(fg);
  const bgSrgb = toSrgbColor(bg);

  if (!fgSrgb || !bgSrgb) {
    return { pass: false, value: Number.NaN };
  }

  const composite = blend(fgSrgb, bgSrgb, alpha);

  if (req.model === "apca") {
    const value = Math.abs(computeApcaLc(composite, bgSrgb));
    const minTarget = req.minLc ?? req.targetLc;
    const maxTarget = req.maxLc ?? Number.POSITIVE_INFINITY;
    return { pass: value >= minTarget && value <= maxTarget, value };
  }

  const value = contrastRatio(composite, bgSrgb);
  return { pass: value >= req.minRatio, value };
};

export function onSolid(query: OnSolidQuery, theme: ThemeConfig): BaseResolvedColor {
  const normalized = normalizeOnSolidQuery(query);
  const contrastRequirement = normalized.contrast ?? defaultContrastForUsage(normalized.usage);
  const alphaStrategy = resolveAlphaStrategy(
    normalized.alpha,
    normalized.usage,
    normalized.output.strict,
  );
  const alpha = alphaStrategy.mode === "none" ? 1 : alphaStrategy.alpha;

  const bgNormalized = normalizeQuery({
    role: normalized.bgRole,
    usage: "bg",
    surface: "solid",
    context: normalized.context,
    state: normalized.state,
    emphasis: normalized.emphasis,
  });
  const bgBase = resolveBaseColor(bgNormalized, theme);
  const bgResolved = applyOperators(bgBase, bgNormalized, theme);
  const bg = bgResolved.oklch;

  const baseFg = bg.l >= 50 ? nearBlack : nearWhite;
  const seedUsed = `oklch(${baseFg.l}% ${baseFg.c} ${baseFg.h})`;

  const solverContext = {
    preset: theme.preset,
    surface: bgNormalized.surface,
    context: mapColorContextToEngine(bgNormalized.context),
  };

  const solved = solveContrast(
    { ...baseFg, alpha },
    bg,
    contrastRequirement,
    solverContext,
    { strict: normalized.output.strict },
  );

  let finalAlpha = alpha;
  let finalColor = solved.color;
  let finalCheck = checkContrastWithAlpha(finalColor, bg, contrastRequirement, finalAlpha);

  if (!finalCheck.pass && finalAlpha < 1) {
    finalAlpha = 1;
    const solvedOpaque = solveContrast(
      { ...baseFg, alpha: 1 },
      bg,
      contrastRequirement,
      solverContext,
      { strict: false },
    );

    finalColor = solvedOpaque.color;
    finalCheck = checkContrastWithAlpha(finalColor, bg, contrastRequirement, finalAlpha);
  }

  if (!finalCheck.pass && normalized.output.strict) {
    throw new Error(
      `onSolid contrast failed (${contrastRequirement.model}) target=${
        contrastRequirement.model === "apca"
          ? contrastRequirement.targetLc
          : contrastRequirement.minRatio
      } value=${finalCheck.value}`,
    );
  }

  return {
    oklch: { ...finalColor, alpha: finalAlpha },
    step: 0,
    variantUsed: "onSolid",
    seedUsed,
  };
}
