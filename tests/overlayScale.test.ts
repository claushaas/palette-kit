import { describe, expect, it } from "vitest";

import { generateOverlayScale } from "../src/overlays/generateOverlayScale.js";

describe("generateOverlayScale", () => {
  it("returns 12 steps for black and white", () => {
    const scale = generateOverlayScale();
    expect(Object.keys(scale.black)).toHaveLength(12);
    expect(Object.keys(scale.white)).toHaveLength(12);
  });

  it("outputs hex with alpha", () => {
    const scale = generateOverlayScale();
    expect(scale.black[1]).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(scale.white[12]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });
});
