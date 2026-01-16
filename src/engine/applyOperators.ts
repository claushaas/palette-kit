import type { NormalizedQuery } from "./normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "./resolveBaseColor.js";
import { mapColorContextToEngine } from "./context.js";
import { applyEmphasisOperator } from "../operators/emphasis.js";
import { applyStateOperator } from "../operators/state.js";

export const applyOperators = (
  base: BaseResolvedColor,
  normalized: NormalizedQuery,
  theme: ThemeConfig,
): BaseResolvedColor => {
  const context = mapColorContextToEngine(normalized.context);
  const operatorInput = {
    oklch: base.oklch,
    context,
    surface: normalized.surface,
    usage: normalized.usage,
    state: normalized.state,
    emphasis: normalized.emphasis,
    preset: theme.preset,
    step: base.step,
  };

  const emphasized = applyEmphasisOperator(operatorInput);
  const stated = applyStateOperator({ ...operatorInput, oklch: emphasized });

  return {
    ...base,
    oklch: stated,
  };
};
