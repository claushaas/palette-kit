import type { Theme } from "../types.js";

type ReactNativeOptions = {
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
};

export function toReactNative(theme: Theme, options?: ReactNativeOptions) {
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? true;
  const includeAlpha = options?.includeAlpha ?? true;

  function buildMode(mode: "light" | "dark") {
    const scales = includeScales
      ? Object.fromEntries(Object.entries(theme.scales).map(([slot, scale]) => [slot, scale[mode]]))
      : {};
    return {
      tokens: includeTokens ? theme.tokens[mode] : {},
      scales,
      alpha: includeAlpha ? theme.alpha?.[mode] : undefined,
    };
  }

  return {
    light: buildMode("light"),
    dark: buildMode("dark"),
  };
}
