import { describe, expect, it } from "vitest";

import { generateAlphaScale } from "../src/alpha/generateAlphaScale.js";

describe("generateAlphaScale", () => {
  it("returns 12 alpha steps", () => {
    const scale = generateAlphaScale("#3d63dd", {
      light: "#ffffff",
      dark: "#111111",
    });
    expect(Object.keys(scale.light)).toHaveLength(12);
    expect(Object.keys(scale.dark)).toHaveLength(12);
  });

  it("outputs hex with alpha", () => {
    const scale = generateAlphaScale("#3d63dd", {
      light: "#ffffff",
      dark: "#111111",
    });
    expect(scale.light[1]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });
});
