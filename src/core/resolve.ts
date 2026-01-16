import type { ColorQuery } from "../types/index.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { applyOperators } from "../engine/applyOperators.js";
import { normalizeQuery } from "../engine/normalize.js";
import { resolveBaseColor } from "../engine/resolveBaseColor.js";

export function resolve(query: ColorQuery, theme: ThemeConfig): BaseResolvedColor {
  const normalized = normalizeQuery(query);
  const base = resolveBaseColor(query, theme);
  return applyOperators(base, normalized, theme);
}
