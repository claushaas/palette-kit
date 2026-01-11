import type { Theme } from "../types.js";

export function toTs(theme: Theme): string {
  const serialized = JSON.stringify(theme, null, 2);
  return `export const theme = ${serialized} as const;\n`;
}
