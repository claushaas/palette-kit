import { describe, expect, it } from "vitest";

import { createTheme } from "./createTheme.js";
import { resolveToken, resolveTokenRegistry, validateTokenRegistry } from "./tokenRegistry.js";
import type { TokenRegistry } from "../types/index.js";

describe("token registry", () => {
  const theme = createTheme({
    seeds: {
      light: { neutral: "#8B8D98", accent: "#3D63DD" },
      dark: { neutral: "#8B8D98", accent: "#3D63DD" },
    },
    preset: "modern",
  });

  it("validates tokens and resolves through theme.resolve", () => {
    const registry: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          description: "App background",
          category: "background",
          query: { role: "bg.app", usage: "bg", surface: "app" },
          states: { hover: true },
        },
      },
    };

    validateTokenRegistry(registry);
    const resolved = resolveTokenRegistry(registry, theme);

    expect(resolved["bg.app"].step).toBeGreaterThan(0);

    const single = resolveToken(registry.tokens["bg.app"], theme);
    const expected = theme.resolve(registry.tokens["bg.app"].query);
    expect(single.step).toBe(expected.step);
  });

  it("throws when required query fields are missing", () => {
    const registry: TokenRegistry = {
      tokens: {
        "text.primary": {
          name: "text.primary",
          query: { role: "text.primary", usage: "text" },
        },
      },
    };

    expect(() => validateTokenRegistry(registry)).toThrow(/requires a surface/i);
  });

  it("throws when output options are provided", () => {
    const registry: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: {
            role: "bg.app",
            usage: "bg",
            surface: "app",
            output: { strict: true },
          },
        },
      },
    };

    expect(() => validateTokenRegistry(registry)).toThrow(/must not include output/i);
  });

  it("throws when token query encodes a non-default state", () => {
    const registry: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: { role: "bg.app", usage: "bg", surface: "app", state: "hover" },
        },
      },
    };

    expect(() => validateTokenRegistry(registry)).toThrow(/must not encode state/i);
  });

  it("throws when token query includes a literal background color hint", () => {
    const registry: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: {
            role: "bg.app",
            usage: "bg",
            surface: "app",
            on: { kind: "color", value: "#fff" },
          },
        },
      },
    };

    expect(() => validateTokenRegistry(registry)).toThrow(/literal background color/i);
  });

  it("throws when token states include invalid keys or non-true values", () => {
    const invalidKey: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: { role: "bg.app", usage: "bg", surface: "app" },
          states: { nope: true } as never,
        },
      },
    };
    expect(() => validateTokenRegistry(invalidKey)).toThrow(/Invalid token state/i);

    const includesDefault: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: { role: "bg.app", usage: "bg", surface: "app" },
          states: { default: true } as never,
        },
      },
    };
    expect(() => validateTokenRegistry(includesDefault)).toThrow(/Invalid token state/i);

    const nonTrueValue: TokenRegistry = {
      tokens: {
        "bg.app": {
          name: "bg.app",
          query: { role: "bg.app", usage: "bg", surface: "app" },
          states: { hover: false } as never,
        },
      },
    };
    expect(() => validateTokenRegistry(nonTrueValue)).toThrow(/must be true/i);
  });
});
