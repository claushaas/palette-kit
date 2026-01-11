import type { Theme } from "../types.js";

function tokenToCssVar(token: string, prefix: string): string {
  const normalized = token.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const dashed = normalized.replace(/\./g, "-");
  return `--${prefix}-${dashed}`;
}

export function toCssVars(theme: Theme, options?: { prefix?: string }): string {
  const prefix = options?.prefix ?? "pk";
  const lines: string[] = [":root {"];

  for (const [token, value] of Object.entries(theme.tokens.light)) {
    lines.push(`  ${tokenToCssVar(token, prefix)}: ${value};`);
  }

  lines.push("}");
  lines.push("");
  lines.push(".dark {");

  for (const [token, value] of Object.entries(theme.tokens.dark)) {
    lines.push(`  ${tokenToCssVar(token, prefix)}: ${value};`);
  }

  lines.push("}");

  return lines.join("\n");
}
