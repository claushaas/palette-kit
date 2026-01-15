import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";
import { toReactNative } from "../src/exporters/toReactNative.js";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
});

describe("toReactNative", () => {
  it("returns light/dark palettes", () => {
    const palette = toReactNative(theme);
    expect(palette).toHaveProperty("light");
    expect(palette).toHaveProperty("dark");
  });

  it("includes tokens and scales", () => {
    const palette = toReactNative(theme);
    expect(palette.light.tokens["bg.app"]).toBeDefined();
    expect(palette.light.scales.neutral[1]).toBeDefined();
  });

  it("includes overlays", () => {
    const palette = toReactNative(theme);
    expect(palette.overlay.black[1]).toBeDefined();
    expect(palette.overlay.white[12]).toBeDefined();
  });
});
