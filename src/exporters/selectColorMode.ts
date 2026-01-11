import type { Theme, ThemeColorMode } from "../types.js";

export function selectThemeColorMode(theme: Theme, mode: "srgb" | "p3"): ThemeColorMode {
  if (mode === "srgb") {
    return theme;
  }

  const scales = Object.fromEntries(
    Object.entries(theme.scales).map(([slot, scale]) => {
      if (!scale.p3) {
        return [slot, scale];
      }
      return [
        slot,
        {
          ...scale,
          light: scale.p3.light,
          dark: scale.p3.dark,
        },
      ];
    }),
  );

  return { ...theme, scales };
}
