import { describe, expect, it } from "vitest";

import type { TokenRegistry } from "../../types/index.js";
import { generateTokenArtifacts } from "./tokens.js";

describe("codegen tokens", () => {
  const registry: TokenRegistry = {
    tokens: {
      "bg.app": {
        name: "bg.app",
        description: "App background.",
        category: "bg",
        query: { role: "bg.app", usage: "bg", surface: "app" },
      },
      "text.primary": {
        name: "text.primary",
        description: "Primary text on standard surfaces.",
        category: "text",
        query: { role: "text.primary", usage: "text", surface: "surface" },
        states: { hover: true },
      },
      "border.default": {
        name: "border.default",
        description: "Default border color.",
        category: "border",
        query: { role: "border.default", usage: "border", surface: "surface" },
      },
    },
  };

  it("generates navigable tokens.ts and tokens.d.ts", () => {
    const { tokensTs, tokensDts } = generateTokenArtifacts(registry);

    expect(tokensTs).toContain('export const tokens = {');
    expect(tokensTs).toContain('bg: {');
    expect(tokensTs).toContain('app: "bg.app"');
    expect(tokensTs).toContain('text: {');
    expect(tokensTs).toContain('primary: "text.primary"');

    expect(tokensTs).toMatchSnapshot();
    expect(tokensDts).toMatchSnapshot();
  });

  it("is deterministic regardless of registry object order", () => {
    const shuffled: TokenRegistry = {
      tokens: {
        "text.primary": registry.tokens["text.primary"],
        "bg.app": registry.tokens["bg.app"],
        "border.default": registry.tokens["border.default"],
      },
    };

    const a = generateTokenArtifacts(registry);
    const b = generateTokenArtifacts(shuffled);

    expect(b.tokenNames).toEqual(a.tokenNames);
    expect(b.tokensTs).toBe(a.tokensTs);
    expect(b.tokensDts).toBe(a.tokensDts);
  });
});

