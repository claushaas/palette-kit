import { describe, expect, it, vi } from "vitest";

import { parseColor } from "./parseColor.js";

describe("parseColor", () => {
  it("parses #fff with alpha 1", () => {
    const result = parseColor("#fff");

    expect(result.input).toBe("#fff");
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

  it("normalizes okLch channels", () => {
    const result = parseColor("#ffffff");
    const [l, c, h] = result.okLch.channels;

    expect(result.okLch.space).toBe("oklch");
    expect(result.okLch.alpha).toBe(1);
    expect(l).toBeGreaterThanOrEqual(0);
    expect(l).toBeLessThanOrEqual(100);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });

  it("preserves okLch alpha", () => {
    const result = parseColor("#33669980");

    expect(result.okLch.alpha).toBeCloseTo(0x80 / 255, 3);
  });

  it("throws on invalid input", () => {
    expect(() => parseColor("#12")).toThrowError(/#12/);
    expect(() => parseColor("#GGGGGG")).toThrowError(/#GGGGGG/);
  });

  it("includes rgb values when conversion fails", async () => {
    vi.resetModules();
    vi.doMock("culori", () => ({
      converter: () => () => undefined,
    }));

    const { parseColor: mockedParseColor } = await import("./parseColor.js");

    expect(() => mockedParseColor("#ffffff")).toThrowError(/r=1, g=1, b=1/);
  });
});
