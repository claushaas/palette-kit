import type { OkLchColor } from "../engine/generateScale.js";
import { clamp } from "../utils/clamp.js";
import type { OperatorInput } from "./types.js";
import { getNeutralL, getSurfaceRange } from "./utils.js";

type StateTuning = {
  hover: number;
  active: number;
  selected: number;
  focus: number;
  disabledChroma: number;
  disabledNeutralPull: number;
};

const STATE_TUNING: Record<OperatorInput["surface"], StateTuning> = {
  app: { hover: 2, active: 4, selected: 3, focus: 2, disabledChroma: 0.45, disabledNeutralPull: 0.45 },
  surface: {
    hover: 2.5,
    active: 4.5,
    selected: 3.5,
    focus: 2.5,
    disabledChroma: 0.45,
    disabledNeutralPull: 0.45,
  },
  subtle: {
    hover: 3,
    active: 5.5,
    selected: 4,
    focus: 3,
    disabledChroma: 0.45,
    disabledNeutralPull: 0.5,
  },
  solid: { hover: 4, active: 7, selected: 5, focus: 4, disabledChroma: 0.4, disabledNeutralPull: 0.55 },
  overlay: {
    hover: 3,
    active: 5.5,
    selected: 4,
    focus: 3,
    disabledChroma: 0.45,
    disabledNeutralPull: 0.5,
  },
  data: { hover: 4, active: 7, selected: 5, focus: 4, disabledChroma: 0.4, disabledNeutralPull: 0.55 },
  transparent: {
    hover: 2,
    active: 4,
    selected: 3,
    focus: 2,
    disabledChroma: 0.45,
    disabledNeutralPull: 0.45,
  },
};

const clampOkLch = (color: OkLchColor, maxChroma: number): OkLchColor => ({
  ...color,
  l: clamp(color.l, 0, 100),
  c: clamp(color.c, 0, maxChroma),
});

export const applyStateOperator = (input: OperatorInput): OkLchColor => {
  const { state, context, surface, usage } = input;
  const tuning = STATE_TUNING[surface];
  const range = getSurfaceRange(input.preset, surface, context);
  const neutralL = getNeutralL(input.preset, surface, context);
  const direction = context === "light" ? -1 : 1;

  if (state === "default") {
    return input.oklch;
  }

  if (state === "focus" && usage !== "ring" && usage !== "border") {
    return input.oklch;
  }

  const next: OkLchColor = { ...input.oklch };

  switch (state) {
    case "hover":
      next.l += direction * tuning.hover;
      break;
    case "active":
      next.l += direction * tuning.active;
      break;
    case "selected":
      next.l += direction * tuning.selected;
      break;
    case "focus":
      next.l += direction * tuning.focus;
      break;
    case "disabled":
      next.c *= tuning.disabledChroma;
      next.l += (neutralL - next.l) * tuning.disabledNeutralPull;
      break;
    default:
      return input.oklch;
  }

  return clampOkLch(next, range.cMax);
};
