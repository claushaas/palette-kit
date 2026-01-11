import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";
import { selectThemeColorMode } from "../src/exporters/selectColorMode.js";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  p3: true,
});

describe("selectThemeColorMode", () => {
  it("returns srgb by default", () => {
    const srgb = selectThemeColorMode(theme, "srgb");
    expect(srgb.scales.accent.light[9]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns p3 if available", () => {
    const p3 = selectThemeColorMode(theme, "p3");
    expect(p3.scales.accent.light[9]).toMatch(/^color\(display-p3 /);
  });
});
