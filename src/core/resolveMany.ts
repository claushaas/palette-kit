import { applyOperators } from "../engine/applyOperators.js";
import { normalizeQuery } from "../engine/normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { resolveBaseColor } from "../engine/resolveBaseColor.js";
import type { ColorQuery } from "../types/index.js";

/**
 * Resolve a batch of color queries while preserving input order.
 *
 * Convenience helper to resolve multiple color queries in a single call.
 */
export function resolveMany(queries: ColorQuery[], theme: ThemeConfig): BaseResolvedColor[] {
  const results: BaseResolvedColor[] = [];

  for (const query of queries) {
    const normalized = normalizeQuery(query);
    const base = resolveBaseColor(normalized, theme);
    results.push(applyOperators(base, normalized, theme));
  }

  return results;
}
