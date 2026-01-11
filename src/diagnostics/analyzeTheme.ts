import { apcaContrast } from "../contrast/apca.js";
import type { Theme, ThemeDiagnostics } from "../types.js";
import { analyzeWarnings } from "./warnings.js";

export function analyzeTheme(theme: Theme): ThemeDiagnostics {
  const contrast: Record<string, number> = {};

  const lightBg = theme.tokens.light["bg.app"];
  const darkBg = theme.tokens.dark["bg.app"];

  if (lightBg) {
    if (theme.tokens.light["text.primary"]) {
      contrast["light.text.primary"] = apcaContrast(theme.tokens.light["text.primary"], lightBg);
    }
    if (theme.tokens.light["text.secondary"]) {
      contrast["light.text.secondary"] = apcaContrast(
        theme.tokens.light["text.secondary"],
        lightBg,
      );
    }
  }

  if (darkBg) {
    if (theme.tokens.dark["text.primary"]) {
      contrast["dark.text.primary"] = apcaContrast(theme.tokens.dark["text.primary"], darkBg);
    }
    if (theme.tokens.dark["text.secondary"]) {
      contrast["dark.text.secondary"] = apcaContrast(theme.tokens.dark["text.secondary"], darkBg);
    }
  }

  if (theme.tokens.light["onSolid.primary"] && theme.tokens.light["accent.solid"]) {
    contrast["light.onSolid.primary"] = apcaContrast(
      theme.tokens.light["onSolid.primary"],
      theme.tokens.light["accent.solid"],
    );
  }

  if (theme.tokens.dark["onSolid.primary"] && theme.tokens.dark["accent.solid"]) {
    contrast["dark.onSolid.primary"] = apcaContrast(
      theme.tokens.dark["onSolid.primary"],
      theme.tokens.dark["accent.solid"],
    );
  }

  let outOfGamutCount = 0;
  for (const scale of Object.values(theme.scales)) {
    outOfGamutCount += scale.meta?.outOfGamutCount ?? 0;
  }

  const warnings = analyzeWarnings(theme);

  return { contrast, outOfGamutCount, warnings };
}
