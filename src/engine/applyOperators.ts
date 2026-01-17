import { applyEmphasisOperator } from "../operators/emphasis.js";
import { applyStateOperator } from "../operators/state.js";
import { mapColorContextToEngine } from "./context.js";
import type { NormalizedQuery } from "./normalize.js";
import type { BaseResolvedColor, ThemeConfig } from "./resolveBaseColor.js";

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

  // Emphasis defines the baseline hierarchy; state applies transient interaction.
  const emphasized = applyEmphasisOperator(operatorInput);
  const stated = applyStateOperator({ ...operatorInput, oklch: emphasized });

  return {
    ...base,
    oklch: stated,
  };
};
