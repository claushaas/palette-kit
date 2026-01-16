import { describe, expect, it } from "vitest";

import { parseColor } from "./parseColor.js";

describe("parseColor", () => {
  it("parses #fff with alpha 1", () => {
    const result = parseColor("#fff");

    expect(result.srgb.space).toBe("srgb");
    expect(result.srgb.alpha).toBe(1);
    expect(result.srgb.channels[0]).toBeCloseTo(1, 6);
    expect(result.srgb.channels[1]).toBeCloseTo(1, 6);
    expect(result.srgb.channels[2]).toBeCloseTo(1, 6);
  });

  it("parses #112233", () => {
    const result = parseColor("#112233");

    expect(result.srgb.channels[0]).toBeCloseTo(0x11 / 255, 6);
    expect(result.srgb.channels[1]).toBeCloseTo(0x22 / 255, 6);
    expect(result.srgb.channels[2]).toBeCloseTo(0x33 / 255, 6);
    expect(result.srgb.alpha).toBe(1);
  });

  it("parses #11223380 with alpha", () => {
    const result = parseColor("#11223380");

    expect(result.srgb.alpha).toBeCloseTo(0x80 / 255, 3);
  });

  it("throws on invalid input", () => {
    expect(() => parseColor("#12")).toThrowError(/#12/);
    expect(() => parseColor("#GGGGGG")).toThrowError(/#GGGGGG/);
  });
});
