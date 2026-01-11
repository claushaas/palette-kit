import type { Step, Theme } from "../types.js";

type CssVarsOptions = {
  prefix?: string;
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
  lightSelector?: string;
  darkSelector?: string;
};

function tokenToCssVar(token: string, prefix: string): string {
  const normalized = token.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const dashed = normalized.replace(/\./g, "-");
  return `--${prefix}-${dashed}`;
}

function scaleToCssVar(slot: string, step: Step, prefix: string): string {
  return `--${prefix}-scale-${slot}-${step}`;
}

function alphaToCssVar(step: Step, prefix: string): string {
  return `--${prefix}-alpha-${step}`;
}

export function toCssVars(theme: Theme, options?: CssVarsOptions): string {
  const prefix = options?.prefix ?? "pk";
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? true;
  const includeAlpha = options?.includeAlpha ?? true;
  const lightSelector = options?.lightSelector ?? ":root";
  const darkSelector = options?.darkSelector ?? ".dark";

  const lines: string[] = [];

  function emitSelector(selector: string, mode: "light" | "dark") {
    lines.push(`${selector} {`);

    if (includeTokens) {
      for (const [token, value] of Object.entries(theme.tokens[mode])) {
        lines.push(`  ${tokenToCssVar(token, prefix)}: ${value};`);
      }
    }

    if (includeScales) {
      for (const [slot, scale] of Object.entries(theme.scales)) {
        for (const [step, value] of Object.entries(scale[mode])) {
          lines.push(`  ${scaleToCssVar(slot, Number(step) as Step, prefix)}: ${value};`);
        }
      }
    }

    if (includeAlpha && theme.alpha) {
      for (const [step, value] of Object.entries(theme.alpha[mode])) {
        lines.push(`  ${alphaToCssVar(Number(step) as Step, prefix)}: ${value};`);
      }
    }

    lines.push("}");
  }

  emitSelector(lightSelector, "light");
  lines.push("");
  emitSelector(darkSelector, "dark");

  return lines.join("\n");
}
