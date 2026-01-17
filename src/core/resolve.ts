import { applyOperators } from "../engine/applyOperators.js";
import { normalizeQuery } from "../engine/normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { resolveBaseColor } from "../engine/resolveBaseColor.js";
import type { ColorQuery } from "../types/index.js";

export function resolve(query: ColorQuery, theme: ThemeConfig): BaseResolvedColor {
  const normalized = normalizeQuery(query);
  const base = resolveBaseColor(normalized, theme);
  return applyOperators(base, normalized, theme);
}
