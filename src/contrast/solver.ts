import { converter } from "culori";
import type { OkLchColor } from "../engine/generateScale.js";
import { getSurfaceRange } from "../operators/utils.js";
import type { CurvePresetName } from "../presets/index.js";
import type { ContrastRequirement, SurfaceIntent } from "../types/index.js";
import { computeApcaLc } from "./apca.js";
import { scoreContrast } from "./scoring.js";
import type { ContrastCheckResult, SolveOptions, SrgbColor } from "./types.js";
import { contrastRatio } from "./wcag2.js";

const toSrgb = converter("rgb");

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const clampOkLch = (color: OkLchColor, cMax: number): OkLchColor => ({
  l: clamp(color.l, 0, 100),
  c: clamp(color.c, 0, cMax),
  h: color.h,
  alpha: color.alpha,
});

const clampOkLchLoose = (color: OkLchColor): OkLchColor => ({
  l: clamp(color.l, 0, 100),
  c: Math.max(0, color.c),
  h: color.h,
  alpha: color.alpha,
});

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

const getTarget = (req: ContrastRequirement): number => {
  if (req.model === "apca") {
    return req.targetLc;
  }

  if (req.model === "wcag2") {
    return req.minRatio;
  }

  return 0;
};

const checkContrast = (
  fg: OkLchColor,
  bg: OkLchColor,
  req: ContrastRequirement,
  epsilon: number,
): ContrastCheckResult => {
  if (req.model === "none") {
    return { model: "none", target: 0, value: 0, pass: true };
  }

  const fgSrgb = toSrgbColor(fg);
  const bgSrgb = toSrgbColor(bg);
  const target = getTarget(req);

  if (!fgSrgb || !bgSrgb) {
    return { model: req.model, target, value: Number.NaN, pass: false };
  }

  if (req.model === "apca") {
    const value = Math.abs(computeApcaLc(fgSrgb, bgSrgb));
    const minTarget = req.minLc ?? req.targetLc;
    const maxTarget = req.maxLc ?? Number.POSITIVE_INFINITY;
    const pass =
      Number.isFinite(value) && value >= minTarget - epsilon && value <= maxTarget + epsilon;
    return { model: "apca", target, value, pass };
  }

  const value = contrastRatio(fgSrgb, bgSrgb);
  const pass = Number.isFinite(value) && value + epsilon >= target;
  return { model: "wcag2", target, value, pass };
};

const pickBetter = (
  current: { color: OkLchColor; result: ContrastCheckResult },
  candidate: { color: OkLchColor; result: ContrastCheckResult },
  req: ContrastRequirement,
) => {
  const currentScore = scoreContrast(current.result, req);
  const candidateScore = scoreContrast(candidate.result, req);
  return candidateScore > currentScore ? candidate : current;
};

export function solveContrast(
  fg: OkLchColor,
  bg: OkLchColor | undefined,
  req: ContrastRequirement,
  ctx: { preset?: CurvePresetName; surface: SurfaceIntent; context: "light" | "dark" },
  opts?: SolveOptions,
): { color: OkLchColor; result: ContrastCheckResult; iterations: number } {
  const options: Required<SolveOptions> = {
    strict: false,
    maxIterations: 24,
    epsilon: 0.01,
    ...opts,
  };

  if (req.model === "none") {
    return {
      color: fg,
      result: { model: "none", target: 0, value: 0, pass: true },
      iterations: 0,
    };
  }

  if (!bg) {
    if (options.strict) {
      throw new Error("Contrast solver requires background");
    }

    return {
      color: fg,
      result: { model: req.model, target: getTarget(req), value: Number.NaN, pass: false },
      iterations: 0,
    };
  }

  const range = getSurfaceRange(ctx.preset, ctx.surface, ctx.context);
  const clamped = clampOkLch(fg, range.cMax);
  const background = clampOkLchLoose(bg);
  let iterations = 0;

  const evaluate = (color: OkLchColor) => {
    const result = checkContrast(color, background, req, options.epsilon);
    iterations += 1;
    return result;
  };

  let best = { color: clamped, result: evaluate(clamped) };

  if (best.result.pass) {
    return { ...best, iterations };
  }

  const lMin = 0;
  const lMax = 100;
  const sampleT = 0.25;
  const sampleDown = clamp(clamped.l + (lMin - clamped.l) * sampleT, lMin, lMax);
  const sampleUp = clamp(clamped.l + (lMax - clamped.l) * sampleT, lMin, lMax);

  let preferredBound = lMin;

  if (iterations < options.maxIterations) {
    const downCandidate = {
      color: { ...clamped, l: sampleDown },
      result: evaluate({ ...clamped, l: sampleDown }),
    };
    best = pickBetter(best, downCandidate, req);

    if (best.result.pass) {
      return { ...best, iterations };
    }

    if (iterations < options.maxIterations) {
      const upCandidate = {
        color: { ...clamped, l: sampleUp },
        result: evaluate({ ...clamped, l: sampleUp }),
      };
      best = pickBetter(best, upCandidate, req);

      if (best.result.pass) {
        return { ...best, iterations };
      }

      preferredBound =
        scoreContrast(upCandidate.result, req) > scoreContrast(downCandidate.result, req)
          ? lMax
          : lMin;
    }
  }

  const remainingAfterSamples = Math.max(0, options.maxIterations - iterations);
  const lSteps = Math.max(4, remainingAfterSamples);

  for (let step = 1; step <= lSteps && iterations < options.maxIterations; step += 1) {
    const t = step / lSteps;
    const l = clamp(clamped.l + (preferredBound - clamped.l) * t, lMin, lMax);
    const candidateColor = { ...clamped, l };
    const result = evaluate(candidateColor);
    const candidate = { color: candidateColor, result };
    best = pickBetter(best, candidate, req);

    if (result.pass) {
      return { color: candidateColor, result, iterations };
    }
  }

  let current = { ...best.color };

  while (iterations < options.maxIterations && current.c > 0) {
    const nextC = clamp(current.c * 0.9, 0, range.cMax);
    current = { ...current, c: nextC };
    const result = evaluate(current);
    best = pickBetter(best, { color: current, result }, req);

    if (result.pass) {
      return { color: current, result, iterations };
    }

    const sweepSteps = Math.min(3, options.maxIterations - iterations);

    for (let step = 1; step <= sweepSteps && iterations < options.maxIterations; step += 1) {
      const t = step / sweepSteps;
      const l = clamp(current.l + (preferredBound - current.l) * t, lMin, lMax);
      const candidateColor = { ...current, l };
      const candidateResult = evaluate(candidateColor);
      best = pickBetter(best, { color: candidateColor, result: candidateResult }, req);

      if (candidateResult.pass) {
        return { color: candidateColor, result: candidateResult, iterations };
      }
    }
  }

  if (options.strict) {
    throw new Error(
      `Contrast solver failed (${best.result.model}) target=${best.result.target} value=${best.result.value} iterations=${iterations}`,
    );
  }

  return { color: best.color, result: best.result, iterations };
}
