import { describe, expect, it } from "vitest";

import { validateConfig } from "./validate.js";
import type { PaletteConfig } from "./config.js";

describe("cli config validation", () => {
  it("accepts a valid config", () => {
    const config: PaletteConfig = {
      theme: {
        seeds: {
          light: { neutral: "#111827", accent: "#3d63dd" },
          dark: { neutral: "#111827", accent: "#3d63dd" },
        },
      },
      tokens: { preset: "modern-ui" },
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  it("rejects missing neutral/accent", () => {
    const config = {
      theme: {
        seeds: {
          light: { neutral: "#111827" },
          dark: { accent: "#3d63dd" },
        },
      },
      tokens: { preset: "modern-ui" },
    } as unknown as PaletteConfig;

    expect(() => validateConfig(config)).toThrow(/must be a string color/);
  });

  it("rejects invalid preset", () => {
    const config = {
      theme: {
        seeds: {
          light: { neutral: "#111827", accent: "#3d63dd" },
          dark: { neutral: "#111827", accent: "#3d63dd" },
        },
      },
      tokens: { preset: "nope" },
    } as unknown as PaletteConfig;

    expect(() => validateConfig(config)).toThrow(/Unsupported token preset/);
  });
});

