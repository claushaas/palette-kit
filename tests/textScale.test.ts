import { describe, expect, it } from "vitest";

import { generateTextScale } from "../src/text/generateTextScale.js";

describe("generateTextScale", () => {
  it("returns 12 steps for light and dark text scales", () => {
    const scale = generateTextScale();
    expect(Object.keys(scale.dark)).toHaveLength(12);
    expect(Object.keys(scale.light)).toHaveLength(12);
  });

  it("outputs opaque hex colors", () => {
    const scale = generateTextScale();
    expect(scale.dark[12]).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(scale.light[1]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
