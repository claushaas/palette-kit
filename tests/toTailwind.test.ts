import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";
import { toTailwind } from "../src/exporters/toTailwind.js";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
});

type TailwindColors = {
  light?: {
    tokens?: {
      bg?: {
        app?: string;
      };
    };
  };
  dark?: unknown;
};

describe("toTailwind", () => {
  it("returns a Tailwind config with colors", () => {
    const config = toTailwind(theme, { mode: "both" });
    const colors = (config as { theme: { extend: { colors: TailwindColors } } }).theme.extend
      .colors;
    expect(colors).toHaveProperty("light");
    expect(colors).toHaveProperty("dark");
  });

  it("nests token keys", () => {
    const config = toTailwind(theme, { mode: "light" });
    const colors = (config as { theme: { extend: { colors: TailwindColors } } }).theme.extend
      .colors;
    expect(colors.light?.tokens?.bg?.app).toBeDefined();
  });
});
