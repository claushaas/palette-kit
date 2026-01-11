import type { Theme } from "../types.js";

export function toJson(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}
