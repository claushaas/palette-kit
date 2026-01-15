import Color from "colorjs.io";

import type { ColorHex, Step, Theme } from "../types.js";

type CssVarsOptions = {
  prefix?: string;
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
  includeOverlays?: boolean;
  includeP3?: boolean;
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

function overlayToCssVar(color: "black" | "white", step: Step, prefix: string): string {
  return `--${prefix}-overlay-${color}-${step}`;
}

function hexToP3(value: ColorHex): string {
  return new Color(value).to("p3").toString({ format: "color" });
}

export function toCssVars(theme: Theme, options?: CssVarsOptions): string {
  const prefix = options?.prefix ?? "pk";
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? true;
  const includeAlpha = options?.includeAlpha ?? true;
  const includeOverlays = options?.includeOverlays ?? true;
  const includeP3 = options?.includeP3 ?? false;
  const lightSelector = options?.lightSelector ?? ":root";
  const darkSelector = options?.darkSelector ?? ".dark";

  const lines: string[] = [];
  const hasP3 = Object.values(theme.scales).some((scale) => scale.p3);

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

    if (includeOverlays) {
      for (const [step, value] of Object.entries(theme.overlay.black)) {
        lines.push(
          `  ${overlayToCssVar("black", Number(step) as Step, prefix)}: ${value};`,
        );
      }
      for (const [step, value] of Object.entries(theme.overlay.white)) {
        lines.push(
          `  ${overlayToCssVar("white", Number(step) as Step, prefix)}: ${value};`,
        );
      }
    }

    lines.push("}");
  }

  emitSelector(lightSelector, "light");
  lines.push("");
  emitSelector(darkSelector, "dark");

  if (includeP3 && hasP3) {
    lines.push("");
    lines.push("@supports (color: color(display-p3 1 1 1)) {");

    function emitP3Selector(selector: string, mode: "light" | "dark") {
      lines.push(`  ${selector} {`);

      if (includeTokens) {
        for (const [token, value] of Object.entries(theme.tokens[mode])) {
          lines.push(`    ${tokenToCssVar(token, prefix)}: ${hexToP3(value)};`);
        }
      }

      if (includeScales) {
        for (const [slot, scale] of Object.entries(theme.scales)) {
          const p3Scale = scale.p3?.[mode];
          if (!p3Scale) {
            continue;
          }
          for (const [step, value] of Object.entries(p3Scale)) {
            lines.push(`    ${scaleToCssVar(slot, Number(step) as Step, prefix)}: ${value};`);
          }
        }
      }

      if (includeAlpha && theme.alpha) {
        for (const [step, value] of Object.entries(theme.alpha[mode])) {
          lines.push(`    ${alphaToCssVar(Number(step) as Step, prefix)}: ${hexToP3(value)};`);
        }
      }

      if (includeOverlays) {
        for (const [step, value] of Object.entries(theme.overlay.black)) {
          lines.push(
            `    ${overlayToCssVar("black", Number(step) as Step, prefix)}: ${hexToP3(value)};`,
          );
        }
        for (const [step, value] of Object.entries(theme.overlay.white)) {
          lines.push(
            `    ${overlayToCssVar("white", Number(step) as Step, prefix)}: ${hexToP3(value)};`,
          );
        }
      }

      lines.push("  }");
    }

    emitP3Selector(lightSelector, "light");
    lines.push("");
    emitP3Selector(darkSelector, "dark");
    lines.push("}");
  }

  return lines.join("\n");
}
