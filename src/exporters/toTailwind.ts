import type { Theme } from "../types.js";

type TailwindOptions = {
  mode?: "light" | "dark" | "both";
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
  includeOverlays?: boolean;
  includeP3?: boolean;
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

function scalesToNested(scales: Theme["scales"], mode: "light" | "dark", useP3?: boolean) {
  const output: Record<string, unknown> = {};
  for (const [slot, scale] of Object.entries(scales)) {
    const source = useP3 ? scale.p3?.[mode] : scale[mode];
    if (!source) {
      continue;
    }
    const stepMap: Record<string, string> = {};
    for (const [step, value] of Object.entries(source)) {
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
  const output: Record<string, Record<string, string>> = {};
  for (const [slot, scale] of Object.entries(alpha)) {
    const stepMap: Record<string, string> = {};
    for (const [step, value] of Object.entries(scale[mode])) {
      stepMap[String(step)] = value;
    }
    output[slot] = stepMap;
  }
  return output;
}

function overlaysToNested(overlays: Theme["overlay"]) {
  const output: Record<string, Record<string, string>> = {
    black: {},
    white: {},
  };
  for (const [step, value] of Object.entries(overlays.black)) {
    output.black[String(step)] = value;
  }
  for (const [step, value] of Object.entries(overlays.white)) {
    output.white[String(step)] = value;
  }
  return output;
}

export function toTailwind(theme: Theme, options?: TailwindOptions) {
  const mode = options?.mode ?? "both";
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? false;
  const includeAlpha = options?.includeAlpha ?? false;
  const includeOverlays = options?.includeOverlays ?? false;
  const includeP3 = options?.includeP3 ?? false;

  function buildModeTokens(modeKey: "light" | "dark", useP3?: boolean) {
    const colors: Record<string, unknown> = {};

    if (includeTokens) {
      colors.tokens = tokensToNested(theme.tokens[modeKey]);
    }
    if (includeScales) {
      colors.scale = scalesToNested(theme.scales, modeKey, useP3);
    }
    if (includeAlpha && theme.alpha) {
      colors.alpha = alphaToNested(theme.alpha, modeKey);
    }
    if (includeOverlays) {
      colors.overlay = overlaysToNested(theme.overlay);
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

  if (includeP3) {
    const hasP3 = Object.values(theme.scales).some((scale) => scale.p3);
    if (hasP3) {
      const p3: Record<string, unknown> = {};
      if (mode === "light" || mode === "both") {
        p3.light = buildModeTokens("light", true);
      }
      if (mode === "dark" || mode === "both") {
        p3.dark = buildModeTokens("dark", true);
      }
      colors.p3 = p3;
    }
  }

  return {
    theme: {
      extend: {
        colors,
      },
    },
  };
}
