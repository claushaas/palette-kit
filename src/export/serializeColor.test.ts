import { describe, expect, it, vi } from "vitest";

import { serializeColor, serializeColorJson } from "./serializeColor.js";
import * as gamut from "../engine/gamut.js";

describe("serializeColor", () => {
  it("serializes CSS with precision and includeSpaces", () => {
    const color = { l: 60.12, c: 0.2345, h: 40.49, alpha: 0.5 };
    const result = serializeColor(color, {
      preferSpace: "oklch",
      includeSpaces: ["srgb", "p3", "oklch"],
      gamutMapping: "compressChroma",
      precision: { l: 1, c: 2, h: 0, alpha: 2 },
    });

    expect(result.value).toBe("oklch(60.1% 0.23 40 / 0.5)");
    expect(result.oklch).toBe("oklch(60.1% 0.23 40 / 0.5)");
    expect(result.srgb).toMatch(/^#[0-9a-f]{8}$/i);
    expect(result.p3?.startsWith("color(display-p3 ")).toBe(true);
  });

  it("serializes JSON with includeSpaces and rounding", () => {
    const color = { l: 60.12, c: 0.2345, h: 40.49, alpha: 0.5 };
    const result = serializeColorJson(color, {
      preferSpace: "p3",
      includeSpaces: ["srgb", "oklch"],
      gamutMapping: "preferP3ThenCompress",
      precision: { l: 1, c: 2, h: 0, alpha: 2 },
    });

    expect(result.value.space).toBe("p3");
    expect(result.oklch).toBeDefined();
    expect(result.srgb).toBeDefined();
    expect(result.oklch?.channels).toEqual([60.1, 0.23, 40]);
    expect(result.alpha).toBe(0.5);
  });

  it("clamps alpha to [0..1] in CSS and JSON outputs", () => {
    const colorHi = { l: 60, c: 0.2, h: 40, alpha: 2 };
    const cssHi = serializeColor(colorHi, { preferSpace: "oklch", precision: { alpha: 2 } });
    expect(cssHi.alpha).toBe(1);
    expect(cssHi.value).toMatch(/^oklch\(/);

    const colorLo = { l: 60, c: 0.2, h: 40, alpha: -1 };
    const jsonLo = serializeColorJson(colorLo, { preferSpace: "oklch", precision: { alpha: 2 } });
    expect(jsonLo.alpha).toBe(0);
    expect(jsonLo.value.alpha).toBe(0);
  });

  it("throws in strict mode when preferred space cannot be serialized", () => {
    const spy = vi.spyOn(gamut, "toGamutRgb").mockReturnValue(null);

    try {
      expect(() =>
        serializeColor(
          { l: 60, c: 0.2, h: 40, alpha: 1 },
          { preferSpace: "srgb", includeSpaces: ["srgb"], strict: true },
        ),
      ).toThrow(/Unable to serialize preferred space: srgb/i);

      expect(() =>
        serializeColorJson(
          { l: 60, c: 0.2, h: 40, alpha: 1 },
          { preferSpace: "p3", includeSpaces: ["p3"], strict: true },
        ),
      ).toThrow(/Unable to serialize preferred space: p3/i);
    } finally {
      spy.mockRestore();
    }
  });
});
