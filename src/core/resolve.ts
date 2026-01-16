import type { ColorQuery } from "../types/index.js";
import type { BaseResolvedColor, ThemeConfig } from "../engine/resolveBaseColor.js";
import { resolveBaseColor } from "../engine/resolveBaseColor.js";

export function resolve(query: ColorQuery, theme: ThemeConfig): BaseResolvedColor {
  return resolveBaseColor(query, theme);
}
