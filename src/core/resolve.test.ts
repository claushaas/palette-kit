import { describe, expect, it } from "vitest";

import { createTheme } from "./createTheme.js";

const theme = createTheme({
  seeds: {
    light: { neutral: "#8B8D98", accent: "#3D63DD" },
    dark: { neutral: "#8B8D98", accent: "#3D63DD" },
  },
  preset: "modern",
});

describe("resolve", () => {
  it("applies state operators via theme.resolve", () => {
    const base = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
    });
    const hover = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
      state: "hover",
    });

    expect(hover.oklch.l).toBeLessThan(base.oklch.l);
  });
});
