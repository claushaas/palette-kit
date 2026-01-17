import { computeApcaLc } from "../contrast/apca.js";
import { solveContrast } from "../contrast/solver.js";
import { blendSrgb, toSrgbColor } from "../contrast/utils.js";
import { contrastRatio } from "../contrast/wcag2.js";
import type { ContrastRequirement, OnSolidQuery } from "../types/index.js";
import { applyOperators } from "./applyOperators.js";
import { mapColorContextToEngine } from "./context.js";
import type { OkLchColor } from "./generateScale.js";
import { normalizeOnSolidQuery, normalizeQuery } from "./normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "./resolveBaseColor.js";
import { resolveBaseColor } from "./resolveBaseColor.js";

const DEFAULT_SOLVE_EPSILON = 0.01;

const nearWhite: OkLchColor = { l: 97, c: 0, h: 0, alpha: 1 };
const nearBlack: OkLchColor = { l: 15, c: 0, h: 0, alpha: 1 };

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
  epsilon = DEFAULT_SOLVE_EPSILON,
): { pass: boolean; value: number } => {
  if (req.model === "none") {
    return { pass: true, value: 0 };
  }

  const fgSrgb = toSrgbColor(fg);
  const bgSrgb = toSrgbColor(bg);

  if (!fgSrgb || !bgSrgb) {
    return { pass: false, value: Number.NaN };
  }

  const composite = blendSrgb(fgSrgb, bgSrgb, alpha);

  if (req.model === "apca") {
    const value = Math.abs(computeApcaLc(composite, bgSrgb));
    const minTarget = req.minLc ?? req.targetLc;
    const maxTarget = req.maxLc ?? Number.POSITIVE_INFINITY;
    return {
      pass: Number.isFinite(value) && value >= minTarget - epsilon && value <= maxTarget + epsilon,
      value,
    };
  }

  const value = contrastRatio(composite, bgSrgb);
  return { pass: Number.isFinite(value) && value + epsilon >= req.minRatio, value };
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
  // Apply state/emphasis operators to the background before onSolid solves.
  const bgResolved = applyOperators(bgBase, bgNormalized, theme);
  const bg = bgResolved.oklch;

  const baseFg = bg.l >= 50 ? nearBlack : nearWhite;
  const seedUsed = `oklch(${baseFg.l}% ${baseFg.c} ${baseFg.h})`;

  const solverContext = {
    preset: theme.preset,
    surface: bgNormalized.surface,
    context: mapColorContextToEngine(bgNormalized.context),
  };

  const solved = solveContrast({ ...baseFg, alpha }, bg, contrastRequirement, solverContext, {
    strict: normalized.output.strict,
  });

  let finalAlpha = alpha;
  let finalColor = solved.color;
  let finalCheck = checkContrastWithAlpha(
    finalColor,
    bg,
    contrastRequirement,
    finalAlpha,
    DEFAULT_SOLVE_EPSILON,
  );

  if (!finalCheck.pass && finalAlpha < 1) {
    finalAlpha = 1;
    const solvedOpaque = solveContrast(
      { ...baseFg, alpha: 1 },
      bg,
      contrastRequirement,
      solverContext,
      { strict: normalized.output.strict },
    );

    finalColor = solvedOpaque.color;
    finalCheck = checkContrastWithAlpha(
      finalColor,
      bg,
      contrastRequirement,
      finalAlpha,
      DEFAULT_SOLVE_EPSILON,
    );
  }

  if (!finalCheck.pass && normalized.output.strict) {
    const target =
      contrastRequirement.model === "apca"
        ? contrastRequirement.targetLc
        : contrastRequirement.model === "wcag2"
          ? contrastRequirement.minRatio
          : 0;
    throw new Error(
      `onSolid contrast failed (${contrastRequirement.model}) target=${
        target
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
