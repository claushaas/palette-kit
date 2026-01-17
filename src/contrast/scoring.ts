import type { ContrastRequirement } from "../types/index.js";
import type { ContrastCheckResult } from "./types.js";

export const scoreApca = (
  value: number,
  target: number,
  min: number,
  max: number,
  hasMax: boolean,
) => {
  if (Number.isNaN(value)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (hasMax) {
    if (value >= min && value <= max) {
      return 1000 - Math.abs(value - target);
    }

    if (value < min) {
      return -(min - value);
    }

    return -(value - max);
  }

  if (value < min) {
    const distance = min - value;
    return -distance * 10 - Math.abs(value - target);
  }

  return -Math.abs(value - target);
};

export const scoreContrast = (result: ContrastCheckResult, req: ContrastRequirement) => {
  if (!Number.isFinite(result.value)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (req.model === "apca") {
    const min = req.minLc ?? req.targetLc;
    const hasMax = req.maxLc !== undefined;
    const max = req.maxLc ?? Number.POSITIVE_INFINITY;
    return scoreApca(result.value, req.targetLc, min, max, hasMax);
  }

  return result.value;
};
