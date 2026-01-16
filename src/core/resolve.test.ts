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
    const baseLight = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
    });
    const hoverLight = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
      state: "hover",
    });
    const baseDark = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "dark",
    });
    const hoverDark = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "dark",
      state: "hover",
    });
    const activeDark = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "dark",
      state: "active",
    });
    const activeLight = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
      state: "active",
    });
    const disabledLight = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "light",
      state: "disabled",
    });
    const disabledDark = theme.resolve({
      role: "bg.solid",
      usage: "bg",
      surface: "solid",
      context: "dark",
      state: "disabled",
    });

    expect(hoverLight.oklch.l).toBeLessThan(baseLight.oklch.l);
    expect(hoverDark.oklch.l).toBeGreaterThan(baseDark.oklch.l);
    expect(Math.abs(activeLight.oklch.l - baseLight.oklch.l)).toBeGreaterThan(
      Math.abs(hoverLight.oklch.l - baseLight.oklch.l),
    );
    expect(Math.abs(activeDark.oklch.l - baseDark.oklch.l)).toBeGreaterThan(
      Math.abs(hoverDark.oklch.l - baseDark.oklch.l),
    );
    expect(disabledLight.oklch.c).toBeLessThan(baseLight.oklch.c * 0.6);
    expect(disabledDark.oklch.c).toBeLessThan(baseDark.oklch.c * 0.6);
  });
});
