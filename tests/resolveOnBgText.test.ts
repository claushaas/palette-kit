import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";
import { resolveOnBgTextTokens } from "../src/text/resolveOnBgText.js";

const options = {
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
} as const;

describe("resolveOnBgTextTokens", () => {
  it("maps background steps to the correct zone tokens", () => {
    const theme = createTheme(options);
    const lightBg = resolveOnBgTextTokens(theme, "light", 2);
    const midBg = resolveOnBgTextTokens(theme, "light", 6);
    const darkBg = resolveOnBgTextTokens(theme, "light", 10);

    expect(lightBg.zone).toBe("light");
    expect(lightBg.primary).toBe(theme.tokens.light["text.onBg.light.primary"]);
    expect(midBg.zone).toBe("mid");
    expect(midBg.tertiary).toBeUndefined();
    expect(darkBg.zone).toBe("dark");
    expect(darkBg.primary).toBe(theme.tokens.light["text.onBg.dark.primary"]);
  });

  it("returns inverted tokens in dark mode", () => {
    const theme = createTheme(options);
    const lightBg = resolveOnBgTextTokens(theme, "dark", 2);

    expect(lightBg.primary).toBe(theme.tokens.dark["text.onBg.light.primary"]);
    expect(lightBg.primary).toBe(theme.tokens.dark["text.light.primary"]);
  });
});
