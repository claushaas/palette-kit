import type { ColorHex } from "../types.js";
import { apcaContrast } from "./apca.js";

const white: ColorHex = "#ffffff";
const black: ColorHex = "#000000";

const alphaLevels = {
  primary: 0.92,
  secondary: 0.72,
  disabled: 0.48,
};

function withAlpha(hex: ColorHex, alpha: number): ColorHex {
  const normalized = hex.replace("#", "");
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${alphaHex}` as ColorHex;
}

function chooseTextColor(background: ColorHex): ColorHex {
  const whiteScore = Math.abs(apcaContrast(white, background));
  const blackScore = Math.abs(apcaContrast(black, background));
  return whiteScore >= blackScore ? white : black;
}

export function onSolidTextTokens(background: ColorHex): {
  primary: ColorHex;
  secondary: ColorHex;
  disabled: ColorHex;
} {
  const base = chooseTextColor(background);
  return {
    primary: withAlpha(base, alphaLevels.primary),
    secondary: withAlpha(base, alphaLevels.secondary),
    disabled: withAlpha(base, alphaLevels.disabled),
  };
}
