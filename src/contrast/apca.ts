import { calcAPCA } from "apca-w3";
import type { ColorHex } from "../types.js";

export function apcaContrast(foreground: ColorHex, background: ColorHex): number {
  const contrast = Number(calcAPCA(foreground, background));
  return Number(contrast.toFixed(2));
}
