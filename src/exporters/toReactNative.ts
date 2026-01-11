import type { Theme } from "../types.js";

type ReactNativeOptions = {
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
  includeP3?: boolean;
};

export function toReactNative(theme: Theme, options?: ReactNativeOptions) {
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? true;
  const includeAlpha = options?.includeAlpha ?? true;
  const includeP3 = options?.includeP3 ?? false;

  function buildMode(mode: "light" | "dark") {
    const scales = includeScales
      ? Object.fromEntries(Object.entries(theme.scales).map(([slot, scale]) => [slot, scale[mode]]))
      : {};
    const p3 = includeP3
      ? Object.fromEntries(
          Object.entries(theme.scales)
            .filter(([, scale]) => scale.p3?.[mode])
            .map(([slot, scale]) => [slot, scale.p3?.[mode]]),
        )
      : undefined;
    return {
      tokens: includeTokens ? theme.tokens[mode] : {},
      scales,
      alpha: includeAlpha ? theme.alpha?.[mode] : undefined,
      p3,
    };
  }

  return {
    light: buildMode("light"),
    dark: buildMode("dark"),
  };
}
