import type { Theme, ThemeColorMode } from "../types.js";

export function toTs(theme: Theme): string {
  const serialized = JSON.stringify(theme, null, 2);
  return `export const theme = ${serialized} as const;\n${typeExports()}`;
}

export function toTsWithMode(theme: Theme, mode: "srgb" | "p3"): string {
  if (mode === "p3") {
    const serialized = JSON.stringify(toP3Theme(theme), null, 2);
    return `export const theme = ${serialized} as const;\n${typeExports()}`;
  }
  const serialized = JSON.stringify(theme, null, 2);
  return `export const theme = ${serialized} as const;\n${typeExports()}`;
}

function toP3Theme(theme: Theme): ThemeColorMode {
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

function typeExports(): string {
  return [
    "export type Theme = typeof theme;",
    'export type ThemeScaleName = keyof Theme["scales"];',
    'export type ThemeTokenName = keyof Theme["tokens"]["light"];',
    'export type ThemeTokenMap = Theme["tokens"]["light"];',
    'export type ThemeOverlay = Theme["overlay"];',
    'export type ThemeMode = keyof Theme["tokens"];',
    'export type ThemeScaleStep = keyof Theme["scales"][ThemeScaleName]["light"];',
    'export type ThemeTokenHex = Theme["tokens"][ThemeMode][ThemeTokenName];',
    'export type ThemeScaleHex = Theme["scales"][ThemeScaleName][ThemeMode][ThemeScaleStep];',
    'export type ThemeAlphaHex = Theme["alpha"] extends undefined ? never : Theme["alpha"][ThemeScaleName][ThemeMode][ThemeScaleStep];',
    "",
  ].join("\n");
}
