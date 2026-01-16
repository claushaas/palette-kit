import type { OkLchColor } from "../engine/generateScale.js";
import { clamp } from "../utils/clamp.js";
import type { OperatorInput } from "./types.js";
import { getNeutralL, getStepLightness, getSurfaceRange } from "./utils.js";

type EmphasisTuning = {
  mutedChroma: number;
  subtleChroma: number;
  strongChroma: number;
  mutedNeutralPull: number;
  subtleNeutralPull: number;
  strongDelta: number;
};

const EMPHASIS_TUNING: Record<OperatorInput["surface"], EmphasisTuning> = {
  app: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.45,
    subtleNeutralPull: 0.2,
    strongDelta: 2,
  },
  surface: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.45,
    subtleNeutralPull: 0.2,
    strongDelta: 2.5,
  },
  subtle: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.5,
    subtleNeutralPull: 0.25,
    strongDelta: 3,
  },
  solid: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.5,
    subtleNeutralPull: 0.25,
    strongDelta: 4,
  },
  overlay: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.5,
    subtleNeutralPull: 0.25,
    strongDelta: 3,
  },
  data: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.5,
    subtleNeutralPull: 0.25,
    strongDelta: 4,
  },
  transparent: {
    mutedChroma: 0.55,
    subtleChroma: 0.75,
    strongChroma: 1.1,
    mutedNeutralPull: 0.45,
    subtleNeutralPull: 0.2,
    strongDelta: 2,
  },
};

const clampOkLch = (color: OkLchColor, maxChroma: number): OkLchColor => ({
  ...color,
  l: clamp(color.l, 0, 100),
  c: clamp(color.c, 0, maxChroma),
});

export const applyEmphasisOperator = (input: OperatorInput): OkLchColor => {
  const { emphasis, context, surface, usage } = input;
  const tuning = EMPHASIS_TUNING[surface];
  const range = getSurfaceRange(input.preset, surface, context);
  const neutralL = getNeutralL(input.preset, surface, context);

  if (emphasis === "default") {
    return input.oklch;
  }

  const next: OkLchColor = { ...input.oklch };

  switch (emphasis) {
    case "muted":
      next.c *= tuning.mutedChroma;
      next.l += (neutralL - next.l) * tuning.mutedNeutralPull;
      break;
    case "subtle":
      next.c *= tuning.subtleChroma;
      next.l += (neutralL - next.l) * tuning.subtleNeutralPull;
      break;
    case "strong": {
      const diff = next.l - neutralL;
      let direction = diff === 0 ? (context === "light" ? -1 : 1) : Math.sign(diff);

      if (usage === "text" || usage === "icon") {
        direction = context === "light" ? -1 : 1;
      } else if (context === "light" && direction > 0) {
        direction = -1;
      } else if (context === "dark" && direction < 0) {
        direction = 1;
      }

      next.c *= tuning.strongChroma;
      next.l += direction * tuning.strongDelta;
      break;
    }
    case "inverted": {
      if (usage === "text" || usage === "icon") {
        const targetStep = input.step === 12 ? 11 : 12;
        const targetL = getStepLightness(input.preset, surface, context, targetStep);
        next.l += (targetL - next.l) * 0.8;
      }
      break;
    }
    default:
      return input.oklch;
  }

  return clampOkLch(next, range.cMax);
};
