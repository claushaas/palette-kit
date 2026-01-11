import type { Theme } from "../types.js";

type TailwindOptions = {
  mode?: "light" | "dark" | "both";
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
};

function setNested(target: Record<string, unknown>, path: string[], value: unknown) {
  let cursor = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[path[path.length - 1]] = value;
}

function tokensToNested(tokens: Record<string, string>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [token, value] of Object.entries(tokens)) {
    setNested(output, token.split("."), value);
  }
  return output;
}

function scalesToNested(scales: Theme["scales"], mode: "light" | "dark") {
  const output: Record<string, unknown> = {};
  for (const [slot, scale] of Object.entries(scales)) {
    const stepMap: Record<string, string> = {};
    for (const [step, value] of Object.entries(scale[mode])) {
      stepMap[String(step)] = value;
    }
    output[slot] = stepMap;
  }
  return output;
}

function alphaToNested(alpha: Theme["alpha"], mode: "light" | "dark") {
  if (!alpha) {
    return undefined;
  }
  const output: Record<string, string> = {};
  for (const [step, value] of Object.entries(alpha[mode])) {
    output[String(step)] = value;
  }
  return output;
}

export function toTailwind(theme: Theme, options?: TailwindOptions) {
  const mode = options?.mode ?? "both";
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? false;
  const includeAlpha = options?.includeAlpha ?? false;

  function buildModeTokens(modeKey: "light" | "dark") {
    const colors: Record<string, unknown> = {};

    if (includeTokens) {
      colors.tokens = tokensToNested(theme.tokens[modeKey]);
    }
    if (includeScales) {
      colors.scale = scalesToNested(theme.scales, modeKey);
    }
    if (includeAlpha && theme.alpha) {
      colors.alpha = alphaToNested(theme.alpha, modeKey);
    }

    return colors;
  }

  const colors: Record<string, unknown> = {};
  if (mode === "light" || mode === "both") {
    colors.light = buildModeTokens("light");
  }
  if (mode === "dark" || mode === "both") {
    colors.dark = buildModeTokens("dark");
  }

  return {
    theme: {
      extend: {
        colors,
      },
    },
  };
}
